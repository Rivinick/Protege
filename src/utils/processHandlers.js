let handlersRegistered = false;

const registerProcessHandlers = () => {
    if (handlersRegistered) {
        return;
    }

    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    handlersRegistered = true;
};

module.exports = registerProcessHandlers;

