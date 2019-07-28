export var createContainersFromPath = function (pathTokens, container) {
    for (var i = 0, j = pathTokens.length; i < j; i++) {
      if (!container[pathTokens[i]]) {
        container[pathTokens[i]] = Object.create(null);
      }
      container = container[pathTokens[i]];
    }
    return container;
  };