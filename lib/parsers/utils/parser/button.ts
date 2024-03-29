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

import { ButtonTag, PlaceObjectFlags, ButtonCharacterFlags, SwfTagCode } from '../../../factories/base/SWFTags';

export function defineButton(tag: ButtonTag, dictionary: any): any {
	const characters = tag.characters;
	const states = {
		up: [],
		over: [],
		down: [],
		hitTest: []
	};
	let i = 0, character;
	while ((character = characters[i++])) {
		const characterItem = dictionary[character.symbolId];
		// The Flash Player ignores references to undefined symbols here. So should we.
		// TODO: What should happen if the symbol gets defined later in the file?
		if (characterItem) {
			const cmd = {
				symbolId: characterItem.id,
				code: SwfTagCode.CODE_PLACE_OBJECT,
				depth: character.depth,
				flags: 0,
				matrix:null,
				cxform:null,
				blendMode: null,
				filters: null
			};

			if (character.filters) {
				cmd.flags |= PlaceObjectFlags.HasFilterList;
				cmd.filters = character.filters;
			}

			if (character.blendMode) {
				cmd.flags |= PlaceObjectFlags.HasBlendMode;
				cmd.blendMode = character.blendMode;
			}

			if (character.matrix) {
				cmd.flags |= PlaceObjectFlags.HasMatrix;
				cmd.matrix = character.matrix;
			}

			if (character.cxform) {
				cmd.flags |= PlaceObjectFlags.HasColorTransform;
				cmd.cxform = character.cxform;
			}

			if (character.flags & ButtonCharacterFlags.StateUp)
				states.up.push(cmd);
			if (character.flags & ButtonCharacterFlags.StateOver)
				states.over.push(cmd);
			if (character.flags & ButtonCharacterFlags.StateDown)
				states.down.push(cmd);
			if (character.flags & ButtonCharacterFlags.StateHitTest)
				states.hitTest.push(cmd);
		} else {
			console.log('undefined character in button ' + tag.id);
		}
	}
	const button = {
		type: 'button',
		id: tag.id,
		buttonActions: tag.buttonActions,
		states: states
	};
	return button;
}
