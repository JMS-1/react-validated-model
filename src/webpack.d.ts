/** Hilfsdeklaration um mit Typescript SASS Module zu verwenden. */
declare module '*.module.scss' {
    const classes: { readonly [key: string]: string }

    export default classes
}
