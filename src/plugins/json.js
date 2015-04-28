export default function json() {

  return function(req, res) {
    if (!res.body) {
      res
        .status(204)
        .end()
      return
    }

    res.json(res.body)
  }

}
