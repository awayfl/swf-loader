
  export class PromiseWrapper<T> {
    public promise: Promise<T>;
    public resolve: (result:T) => void;
    public reject: (reason) => void;

    then(onFulfilled, onRejected) {
      return this.promise.then(onFulfilled, onRejected);
    }

    constructor() {
      this.promise = new Promise<T>(function (resolve, reject) {
        this.resolve = resolve;
        this.reject = reject;
      }.bind(this));
    }
  }
}