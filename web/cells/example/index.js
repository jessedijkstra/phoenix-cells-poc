import Cell from 'web/static/js/cell';

class Example extends Cell {
  constructor(...args) {
    super(...args);

    this.query(
      this.className('name')
    ).innerHTML = `Not ${this.params.name}`;
  }
}

export default Example;
