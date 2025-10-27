import express from 'express'
import connection from '../db/dbConnection.js'
const noticeBoardRouter = express.Router()

noticeBoardRouter.get('/announcements', (req, res) => {
    try {
        const query = '';
        connection.query(query, function (error, results) {
            if (error) throw error;
            console.log(results.length)
            console.log('The solution is: ', results[0]);
            return res.status(200).json({
                success: true,
                count: results.length,
                data: results
            })
        })
    }
    catch (error) {
        console.log(error)
    }
})
export default noticeBoardRouter