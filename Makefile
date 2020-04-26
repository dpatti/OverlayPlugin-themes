build:
	./node_modules/babel-cli/bin/babel.js --presets "babel-preset-es2015" --plugins "transform-react-jsx" app/rdmty.jsx > app/rdmty.js
