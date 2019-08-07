import {URLRequest as URLRequestAway} from "@awayjs/core";
import { ASArray } from "../../avm2/nat/ASArray";
import { axCoerceString } from "../../avm2/run/axCoerceString";
import { Errors } from "../../avm2/errors";
import { ByteArray } from "../../avm2/natives/byteArray";
import { ASObject } from '../../avm2/nat/ASObject';

/**
 * Copyright 2014 Mozilla Foundation
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Class: URLRequest

export class URLRequest extends ASObject {
  
  // Called whenever the class is initialized.
  static axClass: typeof URLRequest;

  private _adaptee:URLRequestAway;
  constructor (url: string = null) {
    super();
    this._adaptee=new URLRequestAway(url);
  }

  get adaptee(): URLRequestAway {
    return this._adaptee;
  }
  set adaptee(value: URLRequestAway) {
    this._adaptee = value;
  }

  get url(): string {
    return this._adaptee.url;
  }
  set url(value: string) {
    value = axCoerceString(value);
    this._adaptee.url = value;
  }
  get data(): ASObject {
    console.log("TODO: URLRequest.data")
    return this._adaptee.data;
  }
  set data(value: ASObject) {
    console.log("TODO: URLRequest.data")
    this._adaptee.data = value;
  }
  get method(): string {
    console.log("TODO: URLRequest.method")
    return this._adaptee.method;
  }
  set method(value: string) {
    console.log("TODO: URLRequest.method")
    this._adaptee.method = value;
  }
  get contentType(): string {
    console.log("TODO: URLRequest.contentType")
    return "";//this._adaptee.contentType;
  }
  set contentType(value: string) {
    console.log("TODO: URLRequest.contentType")
    //this._adaptee.contentType = value;
  }
  get requestHeaders(): ASArray {
    console.log("TODO: URLRequest.requestHeaders")
    return null;//this._adaptee.contentType;
  }
  set requestHeaders(value: ASArray) {
    console.log("TODO: URLRequest.requestHeaders")
    //this._adaptee.contentType = value;
  }
  get digest(): string {
    console.log("TODO: URLRequest.digest")
    return null;//this._adaptee.contentType;
  }
  set digest(value: string) {
    console.log("TODO: URLRequest.digest")
    //this._adaptee.contentType = value;
  }


}