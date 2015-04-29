export default {

  /**
   * Expression
   *
   * @param operator
   * @param left
   * @param right
   * @constructor
   */
  Expression: function(operator, left, right) {
    this.operator = operator.toLowerCase()
    this.left = left
    this.right = right
  },

  /**
   * Function
   *
   * @param name
   * @param args
   * @constructor
   */
  Function: function(name, args) {
    this.name = name
    this.args = args
  },

  /**
   * Identifier
   *
   * @param id
   * @constructor
   */
  Identifier: function(id) {
    this.id = id
  },

  /**
   * NULL Type
   */
  NULL: null,

  /**
   * TRUE Type
   */
  TRUE: true,

  /**
   * FALSE Type
   */
  FALSE: false

}
