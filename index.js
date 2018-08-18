const getBuiltins = require("builtins");
const readPkg = require("read-pkg");
const safeResolve = require("safe-resolve");
const semver = require("semver");

module.exports = ({
  builtins = true,
  dependencies = true,
  packagePath,
  peerDependencies = true
} = {}) => ({
  name: "auto-external",
  options(opts) {
    const pkg = readPkg.sync(packagePath);
    let ids = [];

    if (dependencies && pkg.dependencies) {
      ids = ids.concat(Object.keys(pkg.dependencies));
    }

    if (peerDependencies && pkg.peerDependencies) {
      ids = ids.concat(Object.keys(pkg.peerDependencies));
    }

    if (builtins) {
      ids = ids.concat(getBuiltins(semver.valid(builtins)));
    }

    let external = id => {
      if (
        (typeof opts.external === "function" && opts.external(id)) ||
        (Array.isArray(opts.external) && opts.external.includes(id))
      ) {
        return true;
      }

      const isScopedPackage = id.startsWith("@");
      const packageName = id
        .split("/")
        .slice(0, isScopedPackage ? 2 : 1)
        .join("/");

      return ids.includes(packageName);
    };

    if (Array.isArray(opts.external)) {
      external = Array.from(new Set(opts.external.concat(ids)));
    }

    return Object.assign({}, opts, { external });
  }
});
