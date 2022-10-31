export function unhandledExceptionAndRejectionHandler(): void {
  process.on('uncaughtException', (error: Error) => {
    error.message = `GOT AN UNCAUGHT EXCEPTION => ${error.message}`;
    console.log(error.message, error);
  });

  process.on('unhandledRejection', (error: unknown) => {
    if (error instanceof Error) {
      error.message = `GOT AN UNHANDLED REJECTION => ${error.message}`;
      console.log(error.message, error);
    } else {
      console.log(`GOT AN UNHANDLED REJECTION => ${error}`);
    }
  });
}
