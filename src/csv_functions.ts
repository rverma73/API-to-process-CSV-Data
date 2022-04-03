import { parse } from 'csv-parse';
import * as fs from 'fs';
import { write as writeCSV } from 'fast-csv';
import path from 'path';

interface BookMagazine {
	title: string,
	isbn: string,
	authors: Array<string>,
	description?: string,
	publishedAt?: string,
	isMagazine?: boolean,
}

interface Author {
	email: string,
	firstname: string,
	lastname: string,
}


var authors: Array<Author> = [];
var books_magazines: Array<BookMagazine> = [];

var parse_config = { columns: true, delimiter: ';', skip_empty_lines: true, bom: true };

var sort_book_magazines = () => {
	books_magazines.sort((a, b) => a.title.localeCompare(b.title));
}


var read_books = (err: any, records: any[]) => {
	books_magazines.push(...records.map((record) => {
		return <BookMagazine>{
			title: record.title,
			isbn: record.isbn,
			authors: convert_string_to_list(record.authors),
			description: record.description,
			isMagazine: false,
		}
	}));
	sort_book_magazines();
}


var read_authors = (err: any, records: any) => {
	authors = records;
}
function convert_string_to_list(val: any)
	: Array<string> {
	return val?.split(',') || [];
}

var read_magazines = (err: any, records: any[]) => {

	books_magazines.push(...records.map((record) => {
		return <BookMagazine>{
			title: record.title,
			isbn: record.isbn,
			authors: convert_string_to_list(record.authors),
			publishedAt: record.publishedAt,
			isMagazine: true,
		}
	}));
	sort_book_magazines();
}


var add_new_book_mag = async (new_book_mag: BookMagazine) => {
	books_magazines.push(new_book_mag);
	sort_book_magazines();

	return new Promise<string | any>((resolve, reject) => {
		const writePath = path.join(__dirname, "data", "newFile.csv");
		const ws = fs.createWriteStream(writePath);
		writeCSV(books_magazines, { headers: true, delimiter: ';', writeBOM: true })
			.on("finish", () => {
				console.log('csv file created');
				resolve(writePath);
			})
			.pipe(ws);
	});
}

var init = async () => {
	fs.createReadStream(path.join(__dirname, 'data', 'authors.csv')).pipe(parse(parse_config, read_authors));
	fs.createReadStream(path.join(__dirname, 'data', 'books.csv')).pipe(parse(parse_config, read_books));
	fs.createReadStream(path.join(__dirname, 'data', 'magazines.csv')).pipe(parse(parse_config, read_magazines));
}

export {
	init,
	authors,
	books_magazines,
	BookMagazine,
	Author,
	add_new_book_mag,
}