class Neuron {
  constructor(id, layerId) {
    this.id = id;
    this.layerId = layerId;
    this.threshold = 0;
    this.input = 0;
    this.value = 0;
  }

  activate(a) {
    this.input += a;

    if (this.input >= this.threshold) {
      this.value = 1;
    } else {
      this.value = 0;
    }
  }
}

class Connection {
  constructor(id, n1, n2, weight) {
    this.id = id;
    this.n1 = n1;
    this.n2 = n2;
    this.weight = weight;
  }

  setParent(parent) {
    this.parent = parent;
  }

  transfer() {
    let input = this.parent.neurons[this.n1].value;
    let output = this.weight * input;
    console.log('transfering from ' + this.n1 + ' to ' + this.n2 + ' --- i/o: ' + input + ';' + output);
    if (output != 0) {
      this.parent.neurons[this.n2].activate(output);
    }
  }
}

class Network {
  constructor(threshold) {
    this.neurons = [];
    this.connections = [];

    this.threshold = threshold;
  }

  appendNeuron(neuron) {
    neuron.threshold = this.threshold;
    this.neurons[neuron.id] = neuron;
  }

  appendConnection(connection) {
    connection.setParent(this);
    this.connections[connection.id] = connection;
  }

  calculate() {
    for (var i = 0; i < 2; i ++) {
      for (var j = 0; j < this.connections.length; j ++) {
        if (this.neurons[this.connections[j].n1].layerId == i) {
          this.connections[j].transfer();
        }
      }
    }
  }

  reset() {
    for (var i = 0; i < this.neurons.length; i ++) {
      this.neurons[i].input = 0;
      console.log(i);
    }
  }
}
