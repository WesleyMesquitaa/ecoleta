const express = require("express")
const server = express()

// Pegar o banco de dados

const db = require("./database/db")


// configurar pasta publica
server.use(express.static("public"))

//habilitar o uso do req.body na nossa aplicaçao
server.use(express.urlencoded({ extended: true}))

// Utilizando templates engines
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true,
})

// Configurar camingos da minha aplicaçao
// Pagina inicial 
// req: Requisição
// res: Resposta
server.get("/", (req, res) => {
   return res.render("index.html", { tittle: "Um título"})
})

server.get("/create-point", (req, res) => {
   // req.query: Query Strings da nossa URL
   console.log(req.query)

   return res.render("create-point.html")
})

server.post("/savepoint", (req, res) => {
   
   // req.body: O corpo do nosso formulario
   // console.log(req.body)

   // inserir dados no banco de dados
      const query = `
    INSERT INTO places (
        image,
        name,
        address,
        address2,
        state,
        city,
        items
    ) VALUES (?,?,?,?,?,?,?);
    `

    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items,
      ]

   
   function afterInsertData(err) {
        if(err) {
        console.log(err)
        return res.render("create-point.html", {error: true})
   }

    console.log("Cadastrado com sucesso")
    console.log(this)

    return res.render("create-point.html", {saved: true})
   }

   db.run(query, values, afterInsertData)  

})

// Mostra todos os pontos de coleta na database
server.get("/all-points", (req, res) => {
      db.all(`SELECT * FROM places`, function(err, rows) {
    if(err) {
        return console.log(err)
    }
    const total = rows.length
    
    return res.render("search-results.html", {places: rows, total})
   })
})


server.get("/search", (req, res) => {

   const search = req.query.search

   if (search == "") {
      //pesquisa vazia
      return res.render("search-results.html", { total: 0})
   } 

   // pegar os dados do banco de dados
   db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err, rows) {
   if(err) {
        return console.log(err)
   }
   const total = rows.length
   
   // mostrar a pagina HTML com os dados do banco de dados
   return res.render("search-results.html", {places: rows, total})
   })  
})





// ligar o servidor
server.listen(3000)