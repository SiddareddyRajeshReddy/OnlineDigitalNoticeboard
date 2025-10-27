import mysql from 'mysql'
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'notice_board_db',
    password: ''
})
export default connection