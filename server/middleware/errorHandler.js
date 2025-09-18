export default function errorHandler(err, req, res, next) {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({
        error: {
            code: status,
            message: err.message || "Internal Server Error",
        }
    });
}