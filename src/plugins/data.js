export default function data(body) {

  return function(req, res) {
    res.body = body
  }

}
