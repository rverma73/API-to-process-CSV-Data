import express from 'express';
import cors from 'cors';
import path from 'path';

import { init, authors, books_magazines, BookMagazine, Author, add_new_book_mag } from './csv_functions';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'data')))
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
	var books = [...books_magazines.filter(val => !val.isMagazine).map(val => { return { ...val } })]
		.map((val) => {
			delete val.isMagazine;
			delete val.publishedAt;
			return val;
		});
	var magazines = [...books_magazines.filter(val => val.isMagazine).map(val => { return { ...val } })]
		.map((val) => {
			delete val.isMagazine;
			delete val.description;
			return val;
		});
	res.send({ books: books, magazines: magazines });

})

app.get('/sorted', (req, res) => {
	res.send(books_magazines);
})

app.get('/find/isbn', (req, res) => {
	const isbn = req.query?.isbn;
	if (!isbn) res.status(400).send('isbn is required in query params');
	const filtered = books_magazines.filter(val => val.isbn == isbn);
	const book = filtered.find(val => !val.isMagazine) || 'No Book found';
	const magazine = filtered.find(val => val.isMagazine) || 'No Magazine found';

	res.send({ book: book, magazine: magazine });
})

app.get('/find/email', (req, res) => {
	const email = req.query?.email;
	if (!email) res.status(400).send('email is required in query params');

	const filtered = books_magazines.filter(val => val.authors.find(em => em == email));

	const book = filtered.filter(val => !val.isMagazine) || 'No Book found';
	const magazine = filtered.filter(val => val.isMagazine) || 'No Magazine found';

	res.send({ books: book, magazines: magazine });
})

app.post('/add', async (req, res) => {
	try {
		var new_book_mag: BookMagazine = req.body;
		await add_new_book_mag(new_book_mag);
		res.send({ message: "Added. To access file, use - website/newfile.csv", filename: "newfile.csv" });
	} catch (error) {
		res.status(400).send(`Error while adding: ${error}`);
	}
})

app.listen(port, () => {
	init();
	console.log(`server started at port ${port}`);
})
