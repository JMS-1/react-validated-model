# React Hook für View-Modelle mit Prüfung

Implementiert für DTO(Data Transfer Object)s - also reine JSON Objekte wie man sie über diverse HTTP/REST/GraphQL erhält.

[TBD]

```typescript
import { clsx } from 'clsx'
import * as React from 'react'

import { useModel } from '.'
import styles from './model.stories.module.scss'

export default { title: 'Modell mit Prüfung' }

export const einzelnesTextFeld = ((): JSX.Element => {
    const [simpleData, setSimpleData] = React.useState({ name: 'Jochen' })
    const simpleValidate = React.useMemo(() => ({ $$strict: true, name: { min: 5, type: 'string' } }), [])

    const [model, control] = useModel(simpleData, simpleValidate)

    const errors = control.findErrors()

    const nameErrors = control
        .findErrors('name')
        .map((e) => e.message)
        .join('; ')

    return (
        <div>
            <label className={clsx(nameErrors && styles.error)} title={nameErrors || undefined}>
                <span>Name: </span>
                <input type='text' value={model.name} onChange={(ev) => (model.name = ev.target.value)} />
            </label>
            <button onClick={() => control.reset()}>Zurücksetzen</button>
            <button
                disabled={!control.isDirty() || errors.length > 0}
                onClick={() => setSimpleData(JSON.parse(JSON.stringify(model)))}
            >
                Speichern
            </button>
            <pre>{JSON.stringify(model, null, 2)}</pre>
            <pre>{JSON.stringify(errors, null, 2)}</pre>
            <pre>{JSON.stringify(simpleData, null, 2)}</pre>
        </div>
    )
}) as React.FC
```
