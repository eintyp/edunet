
// DISCLAIMER: This was made over the course of two days, so expect some weird code. (I'm sorry)

const width = 768, height = 512;

/*
 * layer count: network.length
 * neuron count (layer 0): network[0].length
 * neuron count (layer 1): network[1].length / neuron count (layer 0)
 * neuron count (layer 2): network[2].length / neuron count (layer 1)
 */

document.addEventListener('DOMContentLoaded', () => {


	let network;

	const functionTemplates = {
		threshold: x => ( x < 10 ? 0 : 1 ),
		sigmoid: x => 1 / (1 + Math.E ** (-1 * (x - 0)))
	};
	let f = functionTemplates['threshold'];



	let canvasElement = (tagName, attributes = {}) => {
		let elem = document.createElementNS('http://www.w3.org/2000/svg', tagName);
		for (attr in attributes) {
			elem.setAttribute(attr, attributes['attr']);
		}
		return elem;
	}

	let createNeuron = (x, y) => {
		return document.querySelector('.canvas .network').appendChild(
			canvasElement('rect', {
				x: x,
				y: y,
				width: 64,
				height: 48,
				rx: 8
			})
		);
	}

	let createAxon = (x1, y1, x2, y2, ctrl = 128) => {
		return document.querySelector('.canvas .network').appendChild(
			canvasElement('path', {
				d: `M ${x1},${y1} C ${x1 + ctrl},${y1} ${x2 - ctrl},${y2} ${x2},${y2}`
			})
		);
	}

	let createInput = (x, y, callback, className = 'weight', value = 0) => {
		let container = canvasElement('foreignObject', {
			x: x,
			y: y,
			width: 48,
			height: 24
		});

		let input = canvasElement('input', {
			type: 'number',
			value: value || 0,
			class: className
		});

		input.addEventListener('input', callback);
		container.appendChild(input);
		return document.querySelector('.canvas .overlay').appendChild(container);
	}


	let getNeuronCount = (l = network.length - 1) => {
		let n = 1;
		for (let layer = 0; layer <= l; layer ++) n = network[layer].length / n;
		return n;
	}

	let n = (x, y) => {
		let e = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		e.setAttribute('x', x);
		e.setAttribute('y', y);
		e.setAttribute('width', 64);
		e.setAttribute('height', 48);
		e.setAttribute('rx', 8);
		return document.querySelector('.canvas .network').appendChild(e);
	}

	let a = (x1, y1, x2, y2, ctrl = 128) => {
		let e = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		e.setAttribute('d', `M ${x1},${y1} C ${x1 + ctrl},${y1} ${x2 - ctrl},${y2} ${x2},${y2}`);
		return document.querySelector('.canvas .network').appendChild(e);
	}

	let i = (x, y, value = 0, callback, cname = 'weight') => {
		let c = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
		c.setAttribute('x', x);
		c.setAttribute('y', y);
		c.setAttribute('width', 48);
		c.setAttribute('height', 24);

		let e = document.createElement('input');
		e.setAttribute('type', 'number');
		e.setAttribute('value', value || 0);
		e.setAttribute('class', cname);

		e.addEventListener('input', callback);

		c.appendChild(e);
		return document.querySelector('.canvas .overlay').appendChild(c);
	}


	let onLayerInput = (e) => {
		let val = parseInt(e.target.value);
		if (isNaN(val)) return;

		let layer = parseInt(e.target.parentNode.dataset.layer);
		let neuronCount = getNeuronCount(layer);

		/*if (val < neuronCount) {
			if (layer < network.length - 1) {
				let i = network[layer + 1].length;
				while (i--) ((i + 1) % neuronCount == 0) && network[layer + 1].splice(i, 1);
			}
			network[layer].splice(getNeuronCount(layer - 1) * (neuronCount - 1));
		}

		if (val > neuronCount) {

		}*/

		// doing the lazy approach for now
		if (layer < network.length - 1) {
			let nextNeuronCount = getNeuronCount(layer + 1);
			network[layer + 1] = [];
			for (let i = 0; i < val * nextNeuronCount; i ++) network[layer + 1].push(0);
		}
		network[layer] = [];
		for (let i = 0; i < val * getNeuronCount(layer - 1); i ++) network[layer].push(0);

		document.querySelector('.canvas .network').innerHTML = '';
		document.querySelector('.canvas .overlay').innerHTML = '';
		buildNetwork();
	}

	let onNetInput = (e) => {
		let val = parseFloat(e.target.value);
		if (isNaN(val)) return;

		network[e.target.parentNode.dataset.layer][e.target.parentNode.dataset.axon] = val;
		calc();
	}

	let calc = () => {
		let neurons = [];
		let neuronCount = 1;
		document.querySelector('.canvas .text').innerHTML = '';

		for (layer in network) {
			neuronCount = network[layer].length / neuronCount;
			neurons[layer] = [];

			for (let neuron = 0; neuron < neuronCount; neuron ++) {
				if (layer == 0) {
					neurons[0][neuron] = network[0][neuron];
					continue;
				}

				let sum = 0;

				for (let a = 0; a < network[layer].length / neuronCount; a ++) {
					sum += neurons[layer - 1][a] * network[layer][neuron * (network[layer].length / neuronCount) + a];
				}

				neurons[layer][neuron] = f(sum);

				let sumNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
				let actNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
				sumNode.setAttribute('x', (width - 64) / (network.length - 1) * layer + 32);
				sumNode.setAttribute('y', neuronY (neuronCount, neuron) + 14);
				sumNode.innerHTML = `∑=${Math.round(sum * 100) / 100}`;
				actNode.setAttribute('x', (width - 64) / (network.length - 1) * layer + 32);
				actNode.setAttribute('y', neuronY (neuronCount, neuron) + 34);
				actNode.innerHTML = `f(x)=${Math.round(neurons[layer][neuron] * 100) / 100}`;
				document.querySelector('.canvas .text').appendChild(sumNode);
				document.querySelector('.canvas .text').appendChild(actNode);
			}
		}

		location.hash = `#/${JSON.stringify(network)}`;
	}


	/* Base, Height, Distance, Count, Number */
	let centeredY = (b,d,c,n) => ( b + (n - c/2) * d );
	let neuronY = (c,n) => (centeredY (height / 2, 96, c, n) + 24);

	/* it's beautiful */
	let buildNetwork = () => {
		let layerCount = network.length;
		let neuronCount = 1;

		let layerDistance = (width - 64) / (network.length - 1);

		for (let layer = 0; layer < layerCount; layer ++) {
			let axonCount = network[layer].length;
			neuronCount = axonCount / neuronCount;

			for (let neuron = 0; neuron < neuronCount; neuron ++) {
				n ( layerDistance * layer, neuronY (neuronCount, neuron) );

				if (layer == 0) {
					let input = i ( 8, neuronY (neuronCount, neuron) + 12, network[0][neuron], onNetInput, 'in' );
					input.dataset.layer = 0;
					input.dataset.axon = neuron; // semantics: 100
					continue;
				}

				let previousNeuronCount = axonCount / neuronCount;

				for (let axon = 0; axon < previousNeuronCount; axon ++) {
					a ( layerDistance * (layer - 1) + 64,
						neuronY (previousNeuronCount, axon) + 24,
						layerDistance * layer,
						neuronY (neuronCount, neuron) + 24,
						layerDistance / 4
					);
					let input = i (
						layerDistance * layer - 64,
						centeredY ( neuronY (neuronCount, neuron) + 28, 32, previousNeuronCount, axon ),
						network[layer][neuron * previousNeuronCount + axon],
						onNetInput
					);
					input.dataset.layer = layer;
					input.dataset.axon = neuron * previousNeuronCount + axon;
				}
			}
		}

		calc();
	}

	let buildLabels = () => {
		let neuronCount = 1;
		for (let layer = 0; layer < network.length; layer ++) {
			neuronCount = network[layer].length / neuronCount;

			let label = document.createElement('div');
			label.setAttribute('class', 'layer-label');
			label.setAttribute('data-layer', layer);
			label.innerText = layer == 0 ? 'Input Layer' : layer == network.length - 1 ? 'Output Layer' : 'Hidden Layer';
			let input = document.createElement('input');
			input.setAttribute('type', 'number');
			input.setAttribute('min', '1');
			input.setAttribute('max', '5');
			input.setAttribute('value', neuronCount);
			input.addEventListener('input', onLayerInput);
			label.appendChild(input);
			document.querySelector('.layer-labels').appendChild(label);
		}
	}

	let build = () => {
		try {
			network = JSON.parse(location.hash.substr(2));
		} catch (e) {
			network = [
				[ 0, 0 ],
				[ 0, 0, 0, 0, 0, 0 ],
				[ 0, 0, 0 ]
			];
		}
		f = functionTemplates[document.forms.functionType.function.value];

		document.querySelector('.layer-labels').innerHTML = '';
		document.querySelector('.canvas .network').innerHTML = '';
		document.querySelector('.canvas .overlay').innerHTML = '';
		buildNetwork();
		buildLabels();

		document.forms.functionType.addEventListener('change', e => {
			f = functionTemplates[document.forms.functionType.function.value];
			calc();
		});
	}


	document.querySelector('.section-top .button-remove').addEventListener('click', () => {
		if (network.length < 3) return;
		network.pop();
		build();
	});
	document.querySelector('.section-top .button-add').addEventListener('click', () => {
		if (network.length > 4) return;

		let newLayer = [];
		newLayer[getNeuronCount() - 1] = 0;
		network.push(newLayer);
		build();
	});

	build();

});
