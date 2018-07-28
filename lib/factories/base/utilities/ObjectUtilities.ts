
import {assert, release} from "./Debug";
import {isNullOrUndefined, isObject, MapObject} from "../utilities";

export function boxValue(value) {
	if (isNullOrUndefined(value) || isObject(value)) {
		return value;
	}
	return Object(value);
}

export function toKeyValueArray(object: Object) {
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var array = [];
	for (var k in object) {
		if (hasOwnProperty.call(object, k)) {
			array.push([k, object[k]]);
		}
	}
	return array;
}

export function isPrototypeWriteable(object: Object) {
	return Object.getOwnPropertyDescriptor(object, "prototype").writable;
}

export function hasOwnProperty(object: Object, name: string): boolean {
	return Object.prototype.hasOwnProperty.call(object, name);
}

export function propertyIsEnumerable(object: Object, name: string): boolean {
	return Object.prototype.propertyIsEnumerable.call(object, name);
}

/**
 * Returns a property descriptor for the own or inherited property with the given name, or
 * null if one doesn't exist.
 */
export function getPropertyDescriptor(object: Object, name: string): PropertyDescriptor {
	do {
		var propDesc = Object.getOwnPropertyDescriptor(object, name);
		if (propDesc) {
			return propDesc;
		}
		object = Object.getPrototypeOf(object);
	} while (object);
	return null;
}

export function hasOwnGetter(object: Object, name: string): boolean {
	var d = Object.getOwnPropertyDescriptor(object, name);
	return !!(d && d.get);
}

export function getOwnGetter(object: Object, name: string): () => any {
	var d = Object.getOwnPropertyDescriptor(object, name);
	return d ? d.get : null;
}

export function hasOwnSetter(object: Object, name: string): boolean {
	var d = Object.getOwnPropertyDescriptor(object, name);
	return !!(d && !!d.set);
}

export function createMap<T>():MapObject<T> {
	return Object.create(null);
}

export function createArrayMap<T>():MapObject<T> {
	return <MapObject<T>><any>[];
}

export function defineReadOnlyProperty(object: Object, name: string, value: any) {
	Object.defineProperty(object, name, {
		value: value,
		writable: false,
		configurable: true,
		enumerable: false
	});
}

export function copyProperties(object: Object, template: Object) {
	for (var property in template) {
		object[property] = template[property];
	}
}

export function copyOwnProperties(object: Object, template: Object) {
	for (var property in template) {
		if (hasOwnProperty(template, property)) {
			object[property] = template[property];
		}
	}
}

export function copyOwnPropertyDescriptors(object: Object,
										   template: Object,
										   filter: (name: string) => boolean = null,
										   overwrite = true,
										   makeWritable = false) {
	for (var property in template) {
		if (hasOwnProperty(template, property) && (!filter || filter(property))) {
			var descriptor = Object.getOwnPropertyDescriptor(template, property);
			if (!overwrite && hasOwnProperty(object, property)) {
				continue;
			}
			release || assert (descriptor);
			try {
				if (makeWritable && descriptor.writable === false) {
					descriptor.writable = true;
				}
				Object.defineProperty(object, property, descriptor);
			} catch (e) {
				assert("Can't define: " + property);
			}
		}
	}
}

export function copyPropertiesByList(object: Object,
									 template: Object,
									 propertyList: string []) {
	for (var i = 0; i < propertyList.length; i++) {
		var property = propertyList[i];
		object[property] = template[property];
	}
}

export function defineNonEnumerableGetter(obj, name, getter) {
	Object.defineProperty(obj, name, { get: getter,
		configurable: true,
		enumerable: false
	});
}

export function defineNonEnumerableProperty(obj, name, value) {
	Object.defineProperty(obj, name, { value: value,
		writable: true,
		configurable: true,
		enumerable: false
	});
}


export let ObjectUtilities={
	boxValue:boxValue,
	toKeyValueArray:toKeyValueArray,
	isPrototypeWriteable:isPrototypeWriteable,
	hasOwnProperty:hasOwnProperty,
	propertyIsEnumerable:propertyIsEnumerable,
	getPropertyDescriptor:getPropertyDescriptor,
	hasOwnGetter:hasOwnGetter,
	getOwnGetter:getOwnGetter,
	hasOwnSetter:hasOwnSetter,
	createArrayMap:createArrayMap,
	createMap:createMap,
	defineReadOnlyProperty:defineReadOnlyProperty,
	copyProperties:copyProperties,
	copyOwnProperties:copyOwnProperties,
	copyOwnPropertyDescriptors:copyOwnPropertyDescriptors,
	copyPropertiesByList:copyPropertiesByList,
	defineNonEnumerableGetter:defineNonEnumerableGetter,
	defineNonEnumerableProperty:defineNonEnumerableProperty
};
