async function promiseRejectionAsync() {
   try {
      await new Promise ((resolve,reject) => setTimeout(reject(new Error('Oh noooo!')), 1000));
} catch (error) {
   console.error(error.message);
   }
}