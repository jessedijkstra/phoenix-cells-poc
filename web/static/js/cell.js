/**
 * Cell Builder singleton that manages the initialization and teardown of cells
 * existing in the application.
 *
 * @type {Object}
 */
export const Builder = {
  /**
   * The cells currently active on the page
   * @type {Cell[]}
   */
  activeCells: [],

  /**
   * The cells classes that are registered the the register method
   * @type {Object[]}
   */
  availableCells: [],

  /**
   * Register a new cell class
   * @param  {Cell} cell
   */
  register(cell) {
    const cellName = cell.name;

    if (this.availableCells[cellName]) {
      return;
    }

    this.availableCells[cellName] = cell;
  },

  /**
   * Do an initial render of the cells available on the page
   */
  initialize() {
    this.reload();
  },

  /**
   * Inititialize new cells, teardown the removed cells and reload existing
   * cells.
   */
  reload () {
    const found = this.findAndBuild();

    this.destroyOrphans(found);

    this.activeCells = found;
  },

  /**
   * Destroy the orphan cells by inputting the cells currently found on the page
   *
   * @param  {Cell[]} found Cells that are currently present on the page
   * @return {Cell[]}       Cells that are marked for removal
   */
  destroyOrphans(found)  {
    return this.activeCells.filter(cell => {
      if (!this.findByElement(cell.element, found)) {
        cell.destroy();

        return false;
      }

      return true;
    });
  },

  /**
   * Find and build or relaod cells currently available on the page
   *
   * @return {Cell[]}
   */
  findAndBuild() {
    return [].map.call(
      document.querySelectorAll('[data-cell]'),
      element => {
        const cellName = element.dataset.cell;
        const cellConstructor = this.availableCells[cellName];
        const foundCell = this.findByElement(element);

        if (!cellConstructor) {
          throw new Error(`Cell with name ${cellName} not found`)
        }

        if (foundCell) {
          foundCell.reload(element);

          return cell;
        }

        return new (cellConstructor)(element);
      });
  },

  /**
   * Find a cell by its element
   *
   * @param  {HTMLElement} element
   * @param  {[Cells[]]}   [cells=this.activeCells]
   * @return {Cells[]}
   */
  findByElement(element, cells = this.activeCells) {
    (cells || this.activeCells).find(cell => cell.element === element)
  },
}

/**
 * Class representing a cell which
 */
export default class Cell {
  /**
   * Create a new cell by adding an element. The element requires
   * a data attr params to set its params.
   *
   * @param  {HTMLElement} element an element with a `data-params` attribute
   * @return {Cell}
   */
  constructor(element) {
    this.element = element;
    this.name = this.constructor.name;
    this.params = JSON.parse(element.dataset.cellParams);
  }

  /**
   * Teardown function of the Cell element, ensures that the element is removed
   * from the object so it can be marked for garbage collection.
   *
   * This method is a hook used by the Cell Builder, the element argument is
   * input by the Cell Builder so the user can be used for custom tear down.
   *
   * Super must be called when this method is overridden.
   *
   * @param  {HTMLElement} element
   * @return {HTMLElement}
   */
  destroy(element) {
    this.element = null;

    this.onDestroy && this.onDestroy(element);

    return element;
  }

  /**
   * Dummy method that is used to call the onReload hook that can be defined
   * on an extended class.
   * @param  {HTMLElement} element
   * @return {HTMLElement}
   */
  reload(element) {
    this.onReload && this.onReload(element);

    return element;
  }

  className(child) {
    const { name } = this;

    if (!child) {
      return name;
    }

    return `.${name}__${child}`;
  }

  /**
   * jQuery like method to call custom class name selectors on the object by
   * automatically namespacing them to ensure the elements are unique enough
   * to be used.
   *
   * @param  {String} selector
   * @return {HTMLElement[]}
   */
  query(selector) {
    const { element } = this;

    return element.querySelector(selector);
  }

  /**
   * jQuery like method to call custom class name selectors on the object by
   * automatically namespacing them to ensure the elements are unique enough
   * to be used.
   *
   * @param  {String} selector
   * @return {HTMLElement}
   */
  queryAll(selector) {
    const { element } = this;

    return element.querySelectorAll(selector);
  }
}
