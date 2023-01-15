const path = require('path')

/** Das muss im mono-rep und ausserhalb passen. */
const nodeRoot = path.dirname(path.dirname(require.resolve('webpack-node-externals')))
const roots = { react: 'React', 'react-dom': 'ReactDOM' }

module.exports = (env) => {
    const config = {
        devtool: 'source-map',

        /** Hier wird nur ein Einstieg in die Anwendung verwendet - dynamische (Lazy) Komponenten können Chunks erzeugen. */
        entry: { index: path.join(__dirname, './src/index.tsx') },

        /** Externe Module - in den peerDependencies aufgeführt. */
        externals: [
            require('webpack-node-externals')({
                additionalModuleDirs: [nodeRoot],
                importType(request) {
                    const root = roots[request]

                    return root ? { amd: request, commonjs: request, commonjs2: request, root } : request
                },
            }),
        ],

        /** Man beachte, dass --env in der package.json explizit gesetzt wird. */
        mode: env.production ? 'production' : 'development',
        module: {
            rules: [
                /** Code Dateien (Typescript). */
                { test: /\.(ts|tsx)$/, use: 'ts-loader' },
            ],
        },

        /** Stabile Benennung der Module. */
        optimization: { moduleIds: 'natural' },

        /** Standardausgabe für die Bundledateien. */
        output: {
            filename: '[name].js',
            library: '@jms-1/react-validated-model',
            libraryTarget: 'umd',
            path: path.join(__dirname, 'dist'),
        },

        /** Aktuell unterstützte Quelldateiarten. */
        resolve: { extensions: ['.ts', '.tsx', '.js'] },
    }

    return config
}
