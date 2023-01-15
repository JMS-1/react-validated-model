/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types, no-prototype-builtins */

import Validator, { ValidationError, ValidationSchema } from 'fastest-validator'
import * as React from 'react'

/** Steuerschnittstelle für Modelldaten. */
export interface IModelControl {
    /**
     * Ermittelt Prüfergebnisse zu einem Feld.
     *
     * @param prop Das gewünscht Feld (e.g. name aber auch children[13].age)
     * oder alle Prüfergebnisse zu den Modelldaten, wenn leer oder weggelassen.
     */
    findErrors(prop?: string): ValidationError[]

    /**
     * Meldet, ob die Modelldaten von den Daten von den Originaldaten
     * abweichen. Dies umfasst auch eine strukturelle Prüfung, i.e. wenn
     * die Eigenschaften in den Originaldaten nicht in kanonischer
     * Reigenfolge angeordnet sind, können die Modelldaten trotz
     * inhaltlicher Identität als verändert angezeigt werden.
     */
    isDirty(): boolean

    /**
     * Setzt die Modelldaten auf die Originaldaten zurück.
     */
    reset(): void
}

/** Eindeutige Kennung werden auf die einfachst mögliche Art erstellt. */
let counter = 0

/**
 * Meldet verändertliche Modelldaten zu einem Objekt.
 *
 * @param original Die originalen Daten.
 * @param schema Optional die Prüfregeln für die Modelldaten.
 * @returns Ein Feld mit den veränderlichen Modelldaten und einem zusätzlichen Steuerobjekt.
 */
export function useModel<T extends object>(original: T, schema: ValidationSchema = {}): [T, IModelControl] {
    /**
     * Eine Veränderung an diesem Indikator führt dazu, dass die Modelldaten
     * aus dem Original neu geladen werden.
     */
    const [resetId, setResetId] = React.useState(++counter)

    /**
     * Dieser Indikator wird immer dann verändert, wenn sich die Modelldaten
     * verändert haben. Letztlich wird dadurch ein neuer Render-Zyklus
     * ausgelöst.
     */
    const [refreshId, setRefreshId] = React.useState(++counter)

    /**
     * Die eindeutige Serialisierung des Originals. Sollte diese kein Objekt
     * sein (wir verlassen uns hier erst einmal nur auf TypeScript, was ja
     * sicher kein echter Schutz ist), kann in der Folge alles mögliche
     * passieren.
     *
     * Es wird erwartet, dass sich das Orginal nur als Ganzes (Referenz)
     * verändert. Innere Änderung werden nicht wahrgenommen.
     */
    const originalStr = React.useMemo(() => JSON.stringify(original || {}), [original])

    /**
     * Die Prüfregeln müssen im Allgemeinen nur ein einziges Mal erstellt
     * werden, werden aber bei jeder Änderung angewendet, daher ist eine
     * Vorübersetzung sinnvoll. Asynchrone Prüfungen werden nicht unterstützt
     * und werden zu schwerem Fehlverhalten führen.
     */
    const validator = React.useMemo(() => new Validator().compile(schema), [schema])

    /**
     * Die Modelldaten sind erst einmal eine Kopie der Originaldaten, im
     * Gegensatz dazu aber veränderlich.
     *
     * Der resetId Indikator kann durch Verändern dazu verwendet werden,
     * die ursprünglichen Daten erneut zu laden.
     *
     * Sicherheitshalber erfolgt dies auch, wenn sich das Original
     * verändert, aber aus den selben Daten wie das vorherige besteht.
     * Ohne diesen Trigger würden sonst Veränderungen an den Originaldaten
     * nicht zurück gesetzt.
     */
    const model = React.useMemo(
        () => (!resetId || !original || true) && (JSON.parse(originalStr) as T),
        [originalStr, original, resetId]
    )

    /**
     * Verändert den Indikator für das Zurücksetzen der Modelldaten.
     */
    const reset = React.useCallback(() => setResetId(++counter), [])

    /**
     * Meldet durch die Veränderung des Indikators veränderte
     * Modelldaten.
     */
    const refresh = React.useCallback(() => setRefreshId(++counter), [])

    /**
     * Erstellt für ein beliebiges Objekt einen Proxy - das
     * gilt zum Beispiel auch für Felder (Array) oder
     * Datumsobjekte (Date).
     *
     * Beim Zugriff auf die Eigenschaften des Objektes werden
     * bei be Bedarf weitere Proxies erstellt. Solange keine
     * Änderungen an den Daten vorgenommen werden, bleibt die
     * Objektidentitär (===) dieser Proxies erhalten.
     */
    const createProxy = React.useCallback(
        (obj: any): any => {
            const getMap: Record<string | symbol, unknown> = {}

            return new Proxy(obj, {
                get(target, prop) {
                    /**
                     * Um keine unnötigen Render Zyklen auszulösen sollten
                     * wir immer den selben Proxy melden.
                     */
                    if (getMap.hasOwnProperty(prop)) {
                        return getMap[prop]
                    }

                    /**
                     * Gibt es keinen Wert (undefined oder null) kann
                     * dieser unverändert gemeldet werden.
                     */
                    const value: unknown = target[prop]

                    if (value == null) {
                        return value
                    }

                    switch (typeof value) {
                        case 'object':
                            /**
                             * Wenn ein neuer Proxy erzeugt werden muss, so passiert dies
                             * nur einmal um nicht unnötige Render Zyklen auszulösen.
                             */
                            return (getMap[prop] = createProxy(value))
                        case 'function':
                            /**
                             * Methoden werden erst einmal nur sehr naiv umgesetzt.
                             */
                            return (...args: unknown[]) => {
                                /**
                                 * Zuerst merken wir uns den aktuellen Wert der Daten.
                                 */
                                const before = JSON.stringify(target)

                                /**
                                 * Dann wird die Methode blind aufgerufen - im Umgang
                                 * mit call oder apply muss man dabei sehr vorsichtig
                                 * sein.
                                 */
                                const result = value.call(target, ...args)

                                /**
                                 * Wurden Daten verändert (e.g. splice oder push auf
                                 * ein Feld), dann wird der Änderungsindikator verändert.
                                 * Ansonsten (e.g. slice oder map auf ein Feld) passiert
                                 * einfach gar nichts.
                                 */
                                if (JSON.stringify(target) !== before) {
                                    refresh()
                                }

                                /**
                                 * Das Ergebnis der Methode muss natürlich auf jeden Fall
                                 * als Resultat gemeldet werden.
                                 */
                                return result
                            }
                        default:
                            /**
                             * Skalare Werte werden direkt gemeldet. Ein Date Wert
                             * gehört da natürlich nicht dazu.
                             */
                            return value
                    }
                },
                set(target, prop, item) {
                    /**
                     * Beim Setzen von Eigenschaften wird auf die Referenz
                     * geprüft - bei skalaren Werten natürlich direkt der
                     * Wert.
                     */
                    if (target[prop] !== item) {
                        /**
                         * Wurde bereits ein Proxy erstellt, so ist dieser
                         * nun natürlich nicht mehr gültig.
                         */
                        delete getMap[prop]

                        /**
                         * Der Wert wird überschrieben und eine Aktualisierung
                         * über den Änderungsindikator angezeigt. Zur Sicherheit
                         * wird immer eine JSON Kopie der neuen Daten verwendet.
                         */
                        target[prop] = item === undefined ? item : JSON.parse(JSON.stringify(item))

                        refresh()
                    }

                    return true
                },
            })
        },
        [refresh]
    )

    /**
     * Die Modelldaten werden in einem Proxy gekapselt zurückgeliefert,
     * der aus Faulheit allerdings nur get und set überwacht. Für die
     * meisten Anwendungsfälle wird das ausreichend sein.
     *
     * Im Allgemeinen wird ein neuer Proxy erstellt, sobald der
     * Indikator für die Veränderung an den Modelldaten sich verändert
     * hat. Dies löst dann im Allgemeinen einen Render Zyklus aus.
     */
    const proxy = React.useMemo(() => (!refreshId || true) && createProxy(model), [model, createProxy, refreshId])

    /**
     * Die Prüfung durch den fastest-validator erfolgt nur, wenn
     * sie auch explizit abgefragt wird.
     */
    const errors = React.useCallback(
        () => (!refreshId || true) && (validator(model) as ValidationError[] | true),
        [model, validator, refreshId]
    )

    /**
     * Die Prüfergebnisse werden über eine Hilfsmethode zur Verfügung
     * gestellt, Die einen einfachen Zugriff auf die Prüfung einzelner
     * Felder des Objektes erlaubt.
     */
    const findErrors = React.useCallback(
        (prop: string) => {
            /** Erst einal prüfen, ob überhaupt Fehler aufgetreten sind. */
            const all = errors()

            if (all === true) {
                return []
            }

            /** Das gesamte Prüfergebnis melden - über alle Eigenschaften. */
            if (!prop) {
                return all
            }

            /** Das Prüfergebnis zu einer einzelnen Eigenschaft. */
            const prefix1 = `${prop}.`
            const prefix2 = `${prop}[`

            return all.filter(
                (e) => e.field && (e.field === prop || e.field.startsWith(prefix1) || e.field.startsWith(prefix2))
            )
        },
        [errors]
    )

    /**
     * Prüft auf Wunsch, ob sich irgendwas an den Eingangsdaten
     * verändert hat.
     */
    const isDirty = React.useCallback(
        () => (!refreshId || true) && JSON.stringify(model) !== originalStr,
        [model, originalStr, refreshId]
    )

    /** Erstellt zusäzlich zu dem Proxy der Modelldaten ein Steuerobject. */
    const control = React.useMemo<IModelControl>(() => ({ findErrors, isDirty, reset }), [reset, findErrors, isDirty])

    return [proxy, control]
}
