import { AXApplicationDomain } from '../run/AXApplicationDomain';
import { nativeClassLoaderNames } from './builtinNativeClasses';
import { makeClassLoader } from '../nat/makeClassLoader';

/**
 * Installs class loaders for all the previously registered native classes.
 */
export function installClassLoaders(applicationDomain: AXApplicationDomain, container: Object) {
    for (var i = 0; i < nativeClassLoaderNames.length; i++) {
      var loaderName = nativeClassLoaderNames[i].name;
      var loaderAlias = nativeClassLoaderNames[i].alias;
      var nsType = nativeClassLoaderNames[i].nsType;
      makeClassLoader(applicationDomain, container, loaderName, loaderAlias, nsType);
    }
  }