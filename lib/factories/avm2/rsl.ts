import { Multiname } from "./abc/lazy/Multiname"
import { RecordedData } from "./recorded-data"

export var recording:Boolean = false

let timeout: number = 3 * 60 * 1000

export class Resolver {
    extra: string = ""
    started: boolean = false
    keys: string[] = []
    resolved = {}    
    boxed = {}    
    coerced = {}    
    
    resolveGet(mn: Multiname): string {
        return RecordedData["get"][this.extra + mn.key()] || RecordedData["get"][mn.key()]
    }
    
    resolveSet(mn: Multiname): string {
        return RecordedData["set"][this.extra + mn.key()] || RecordedData["set"][mn.key()]
    }
    
    recordResolve(mn: Multiname, r: string) {
        if (!this.started) {
            setTimeout(() => this.print(), timeout)
            this.started = true
        }

        let key = mn.key()

        if (!this.resolved[key]) {
            this.keys.push(key)
            this.resolved[key] = {}
        }
    
        if (!this.resolved[key][this.extra])
            this.resolved[key][this.extra] = [r]
        else
        if (this.resolved[key][this.extra].indexOf(r) < 0) {
            this.resolved[key][this.extra].push(r)

            // console.log("RECORD RESOLVE " + key + " : " + r)
            //
            // if (this.resolved[key][this.extra].length > 1)
            //     console.log("CONFLICT " + key + " => " + this.resolved[key][this.extra].join(" | "))
        }
    }
    
    recordBox(mn: Multiname) {
        let key = mn.key()

        if (!this.boxed[key])
            this.boxed[key] = {}

        if (!this.boxed[key][this.extra])
            this.boxed[key][this.extra] = true
    }

    recordFun(mn: Multiname) {
        let key = mn.key()

        if (!this.boxed[key])
            this.boxed[key] = {}

        if (!this.boxed[key][this.extra])
            this.boxed[key][this.extra] = true
    }

    recordCoerce(mn: Multiname) {
        let key = mn.key()

        if (!this.coerced[key])
            this.coerced[key] = {}

        if (!this.coerced[key][this.extra])
            this.coerced[key][this.extra] = true
    }

    print() {
        let js = []
        
        js.push("export class RecordedData {")

        js.push("    static conflict = {")

        for (let i = 0; i < this.keys.length; i++) {
            let key = this.keys[i]
            
            let extras = []
            for (let extra in this.resolved[key])
                if (this.resolved[key].hasOwnProperty(extra))
                    extras.push(extra)

            for (let j = 0; j < extras.length; j++)
                if (this.resolved[key][extras[j]].length > 1)
                    js.push("        \"" + extras[j] + key + "\": [\"" + this.resolved[key][extras[j]].join("\", \"") + "\"],")
        }

        js.push("    }")

        js.push("    static get = {")
        
        for (let i = 0; i < this.keys.length; i++) {
            let key = this.keys[i]

            let extras = []
            for (let extra in this.resolved[key])
                if (this.resolved[key].hasOwnProperty(extra))
                    extras.push(extra)

            let resolved = []
            for (let j = 0; j < extras.length; j++)
                for (let k = 0; k < this.resolved[key][extras[j]].length; k++)
                    if (resolved.indexOf(this.resolved[key][extras[j]][k]) < 0)
                        resolved.push(this.resolved[key][extras[j]][k])
                    
            if (!this.boxed[key] && resolved.length == 1)
                js.push("        \"" + key + "\": \"" + resolved[0] + "\",")
            else 
            for (let j = 0; j < extras.length; j++)
                if (this.resolved[key][extras[j]].length == 1)
                    if (!this.boxed[key] || !this.boxed[key][extras[j]])
                        js.push("        \"" + extras[j] + key + "\": \"" + this.resolved[key][extras[j]][0] + "\",")
        }   
        
        js.push("    }")

        js.push("    static set = {")
        
        for (let i = 0; i < this.keys.length; i++) {
            let key = this.keys[i]

            let extras = []
            for (let extra in this.resolved[key])
                if (this.resolved[key].hasOwnProperty(extra))
                    extras.push(extra)

            let resolved = []
            for (let j = 0; j < extras.length; j++)
                for (let k = 0; k < this.resolved[key][extras[j]].length; k++)
                    if (resolved.indexOf(this.resolved[key][extras[j]][k]) < 0)
                        resolved.push(this.resolved[key][extras[j]][k])

            if (!this.coerced[key] && resolved.length == 1)
                js.push("        \"" + key + "\": \"" + resolved[0] + "\",")
            else
                for (let j = 0; j < extras.length; j++)
                    if (this.resolved[key][extras[j]].length == 1)
                        if (!this.coerced[key] || !this.coerced[key][extras[j]])
                            js.push("        \"" + extras[j] + key + "\": \"" + this.resolved[key][extras[j]][0] + "\",")
        }   
        
        js.push("    }")

        /*
        js.push("    static resolved = {")

        for (let i = 0; i < this.keys.length; i++) {
            let key = this.keys[i]

            js.push("        \"" + key + "\": [\"" + this.resolved[key].join("\", \"") + "\"],")
        }

        js.push("    }")
        */

        /*
        let js = ["    static boxed = {"]
        
        for (let i = 0; i < this.boxed.length; i++) {
            let key = this.boxed[i]
            
                if (this.resolved[key].length == 1)
                    js.push("        \"" + key + "\": [\"" + this.resolved[key].join(", ") + "\"],")
        }   
        
        js.push("    }")
        */
        
        js.push("}")
        
        console.log(js.join("\n"))
        
        console.log(this.resolved)
    }
}

export var resolver:Resolver = new Resolver()
