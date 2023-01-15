const { resolve } = require('path')

module.exports = {
    stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: ['@storybook/addon-actions', '@storybook/addon-essentials', '@storybook/addon-knobs'],
    core: { builder: 'webpack5', disableTelemetry: true },
    webpackFinal: (config) => {
        config.module.rules.push({
            include: resolve(__dirname, '../'),
            test: /\.scss$/,
            use: [
                'style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        modules: { auto: true, localIdentName: '[local]-[hash:base64:5]' },
                        sourceMap: false,
                        url: false,
                    },
                },
                'sass-loader',
            ],
        })

        return config
    },
}
