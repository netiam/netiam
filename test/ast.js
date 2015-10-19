import AST from '../src/rest/odata/ast'

describe('AST', function() {

  it('should create and return an expression', function() {
    let expression = new AST.Expression('EQ', 1, 1)

    expression.should.have.property('operator')
    expression.should.have.property('left')
    expression.should.have.property('right')

    expression.operator.should.eql('eq')
    expression.left.should.eql(1)
    expression.right.should.eql(1)
  })

  it('should create and return a function', function() {
    let func = new AST.Function('func', [1, 2, 3])

    func.should.have.property('name')
    func.should.have.property('args')

    func.name.should.eql('func')
    func.args.should.eql([1, 2, 3])
  })

  it('should create and return an identifier', function() {
    let id = new AST.Identifier('id')

    id.should.have.property('id')
    id.id.should.eql('id')
  })

})
