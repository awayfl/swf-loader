
type TLoaderRuleFunc = (url: string) => boolean;
type TLoaderRuleFuncResult = (url: string) => string;

/**
 * Global rulles for URLLoader and Loader instances, applyed before local rulles
 */
export const globalRedirectRules: IRedirectRule[] = [];

export interface IRedirectRule {
	test: string | RegExp | TLoaderRuleFunc | undefined,
	resolve?: string | RegExp| TLoaderRuleFuncResult | undefined,
	supressErrors?: boolean,
	supressLoad?: boolean,
}

export function matchRedirect(url: string, rules?: Array<IRedirectRule>): {url: string, supressErrors: boolean, supressLoad: boolean} | undefined {

    let rule : {
        url: string, supressErrors: boolean, supressLoad: boolean
    } = undefined;

    const all = rules ? globalRedirectRules.concat(rules) : globalRedirectRules;

    all.forEach(({test, resolve, supressErrors = false, supressLoad = false})=>{
        let passed: boolean | string = false;

        if(typeof test  === 'function') {
            passed = test(url);
        } 
        else if (test instanceof RegExp) {
            passed = test.test(url);
        }
        else if (typeof test === 'string') {
            passed = test === url;
        }

        if(passed) {					
            if(rule) {
                console.warn('[LOADER] Duplicate redirect rules, latest rule would be used!');
            }

            rule = {
                url, supressErrors : supressErrors, supressLoad : supressLoad
            }

            if(typeof resolve === 'function') {
                rule.url = resolve(url);
            } else if(resolve instanceof RegExp) {
                rule.url = url.match(resolve)[0];
            } else if (typeof resolve === 'string') {
                rule.url = resolve;
            } else if (typeof passed === 'string') {
                rule.url = passed;
            }

            if(typeof rule.url === 'undefined'){
                console.warn("[LOADER] Redirect url is null, would be used  original url!");
                rule.url = url;
            }
        };
    });


    return rule;
}