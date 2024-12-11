const path = require('path');

module.exports = {
	entry: './src/index.js', // Main entry file
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js',
		libraryTarget: 'commonjs2' // Required for Firebase Functions
	},
	module: {
        rules: [
            {
                test: /\.(js|jsx)$/, // Match .js and .jsx files
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    },
                },
            },
            {
                test: /\.css$/, // Optional: Handle CSS imports
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx'], // Resolve these extensions automatically
    },
    target: 'web',
    mode: 'production', // Set to 'development' for debugging
};

