let http = require('http')
let fs = require('fs')
let path = require('path')
let axios = require('axios')

let data_file=path.join(__dirname,'books.json')

if(!fs.existsSync(data_file)){
    fs.writeFileSync(data_file,JSON.stringify([]))
}

function readBooks(){
    return JSON.parse(fs.readFileSync(data_file,'utf8'))
}

function writeBooks(books){
    fs.writeFileSync(data_file,JSON.stringify(books,null,2))
}

function sendJSON(res,status,data){
    res.writeHead(status,{'content-type':'application/json'})
    res.end(JSON.stringify(data))

}

let server=http.createServer((req,res)=>{
    let url=req.url
    let method=req.method


  
  if(url==='/books' && method==='GET'){
    try{
        let books=readBooks()
        sendJSON(res,200,books)
    }catch{
        sendJSON(res,500,{message:'Server xatosi'})
    }
    return
  }

  
  if(url.startsWith('/books/') && method==='GET'){
    let id=url.split('/')[2]
    
    try{
        let books=readBooks()
        let book=books.find((x)=>x.id===id)
        if(!book) sendJSON(res,404,{message:'Foydalanuvchi xatosi'})
        else sendJSON(res,200,book)

    }catch{
        sendJSON(res,500,{message:'Server xatosi'})

    }
    return

  }

  
  if(url==='/books' && method==='POST'){
    let body=''
    req.on('data',chunk=>{body+=chunk.toString()})
    req.on('end',()=>{
        try{
            let {title,author,year}=JSON.parse(body)
            if(!title || !author || !year){
                sendJSON(res,400,{message:'title, yozuvchi,yil majburiy'})
                return
            }
            let books=readBooks()
            let newBook={id:Math.random().toString(36).substr(2,9),title,author,year}
            books.push(newBook)
            writeBooks(books)
            sendJSON(res,201,newBook)

        }catch{
            sendJSON(res,500,{message: 'Server xatosi'})

        }
    })
    return
  }

  
  if (url.startsWith('/books/') && method === 'PUT') {
    const id = url.split('/')[2]
    let body = ''
    req.on('data', chunk => { body += chunk.toString() })
    req.on('end', () => {
      try {
        let { title, author, year } = JSON.parse(body)
        if (!title || !author || !year) {
          sendJSON(res, 400, { message: 'title, author va year majburiy' })
          return
        }
        let books = readBooks()
        let index = books.findIndex(b => b.id === id)
        if (index === -1) {
          sendJSON(res, 404, { message: 'Kitob topilmadi' })
          return
        }
        books[index] = { id, title, author, year }
        writeBooks(books)
        sendJSON(res, 200, books[index])
      } catch {
        sendJSON(res, 500, { message: 'Server xatosi' })
      }
    })
    return
  }

  
  if (url.startsWith('/books/') && method === 'DELETE') {
    const id = url.split('/')[2]
    try {
      let books = readBooks()
      let index = books.findIndex(b => b.id === id);
      if (index === -1) {
        sendJSON(res, 404, { message: 'Kitob topilmadi' })
        return;
      }
      books.splice(index, 1)
      writeBooks(books)
      sendJSON(res, 200, { message: "Kitob ochirildi" })
    } catch {
      sendJSON(res, 500, { message: 'Server xatosi' })
    }
    return
  }

  
  sendJSON(res, 404, { message: 'Endpoint topilmadi' })
})


server.listen(3000, async () => {
  console.log('Server http://localhost:3000 da ishlayapti...')

  try {
    let baseurl = 'http://localhost:3000/books'

    
    let res = await axios.get(baseurl)
    console.log('Barcha kitoblar:', res.data)

    
    res = await axios.post(baseurl, { title: 'Node.js Asoslari', author: 'John Doe', year: 2024 })
    let book = res.data
    console.log('Yangi kitob:', book)

    
    res = await axios.get(`${baseurl}/${book.id}`)
    console.log('ID orqali kitob:', res.data)

    
    res = await axios.put(`${baseurl}/${book.id}`, { title: 'Node.js Advanced', author: 'Jane Doe', year: 2025 })
    console.log('Yangilangan kitob:', res.data)

    
    res = await axios.delete(`${baseurl}/${book.id}`)
    console.log(res.data)

    
    res = await axios.get(baseurl)
    console.log('Oxirgi kitoblar royxati:', res.data)

  } catch (err) {
    console.error('Xatolik tafsiloti:', err.message)
    if (err.response) console.error('Server javobi:', err.response.data)
  }
})
