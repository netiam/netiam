import d3 from 'd3'
import jsdom from 'jsdom'

export default function(opts = {}) {
  const {width = 400} = opts
  const {height = 400} = opts
  const {ticks = 100} = opts

  return function(req, res) {
    if (!res.body) {
      return res
        .status(204)
        .end()
    }

    const data = res.body

    const document = jsdom.jsdom()
    const graph = d3.select(document.body).append('svg')
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr(':xmlns:xlink', 'http://www.w3.org/1999/xlink')
      .attr('width', width)
      .attr('height', height)

    const force = d3.layout.force()
      .charge(-300)
      .linkDistance(100)
      .size([width, height])
      .nodes(data.nodes)
      .links(data.edges)

    const link = graph.selectAll('.link')
      .data(data.edges)
      .enter().append('line')
      .attr('class', 'link')
      .style({
        stroke: '#ddd',
        strokeWidth: 4
      })

    const gnode = graph.selectAll('g.gnode')
      .data(data.nodes)
      .enter()
      .append('g')
      .classed('gnode', true)

    gnode.append('circle')
      .attr('class', 'node')
      .attr('r', 30)
      .style({
        fill: '#4b4475',
        strokeWidth: 4,
        stroke: '#fff'
      })

    gnode.append('text')
      .attr('y', 4)
      .style({
        fill: '#fff',
        fontSize: '14px',
        fontFamily: 'sans-serif',
        textAnchor: 'middle'
      })
      .text(function(d) {
        return d.name
      })

    force.on('tick', function() {
      link
        .attr('x1', function(d) {
          return d.source.x
        })
        .attr('y1', function(d) {
          return d.source.y
        })
        .attr('x2', function(d) {
          return d.target.x
        })
        .attr('y2', function(d) {
          return d.target.y
        })

      gnode
        .attr('transform', function(d) {
          return 'translate(' + [d.x, d.y] + ')'
        })

    })

    force.start()
    for (let i = 0; i < ticks; i += 1) {
      force.tick()
    }
    force.stop()

    const html = d3.select(document.body).html()

    res
      .status(200)
      .set('Content-Type', 'image/svg+xml')
      .set('Content-Length', html.length)
      .send(html)
  }

}
