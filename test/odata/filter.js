import Filter from '../../src/rest/odata/filter'

export default function() {
  it('should create "and" expression', function() {
    const filter = new Filter('1 AND 1')
    const compiled = filter.toObject()

    compiled.should.eql({'$and': [1, 1]})
  })

  it('should create "or" expression', function() {
    const filter = new Filter('1 OR 1')
    const compiled = filter.toObject()

    compiled.should.eql({'$or': [1, 1]})
  })

  it('should create "eq" expression', function() {
    const filter = new Filter('1 EQ 1')
    const compiled = filter.toObject()

    compiled.should.eql({'1': 1})
  })

  it('should create "ne" expression', function() {
    const filter = new Filter('1 NE 1')
    const compiled = filter.toObject()

    compiled.should.eql({'1': {'$ne': 1}})
  })

  it('should create "gt" expression', function() {
    const filter = new Filter('1 GT 1')
    const compiled = filter.toObject()

    compiled.should.eql({'1': {'$gt': 1}})
  })

  it('should create "ge" expression', function() {
    const filter = new Filter('1 GE 1')
    const compiled = filter.toObject()

    compiled.should.eql({'1': {'$gte': 1}})
  })

  it('should create "lt" expression', function() {
    const filter = new Filter('1 LT 1')
    const compiled = filter.toObject()

    compiled.should.eql({'1': {'$lt': 1}})
  })

  it('should create "le" expression', function() {
    const filter = new Filter('1 LE 1')
    const compiled = filter.toObject()

    compiled.should.eql({'1': {'$lte': 1}})
  })

}
