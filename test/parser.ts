import assert from 'assert';
import { parse } from '../built/index';
import { createNode } from '../built/util';
import {
	TEXT, CENTER, FN, UNI_EMOJI, MENTION, EMOJI_CODE, HASHTAG, N_URL, BOLD, SMALL, ITALIC, STRIKE, QUOTE, MATH_BLOCK, SEARCH, CODE_BLOCK, LINK
} from './node';

describe('parser', () => {
	describe('text', () => {
		it('普通のテキストを入力すると1つのテキストノードが返される', () => {
			const input = 'abc';
			const output = [TEXT('abc')];
			assert.deepStrictEqual(parse(input), output);
		});
	});

	describe('quote', () => {
		it('1行の引用ブロックを使用できる', () => {
			const input = '> abc';
			const output = [
				QUOTE([
					TEXT('abc')
				])
			];
			assert.deepStrictEqual(parse(input), output);
		});
		it('複数行の引用ブロックを使用できる', () => {
			const input = `
> abc
> 123
`;
			const output = [
				QUOTE([
					TEXT('abc\n123')
				])
			];
			assert.deepStrictEqual(parse(input), output);
		});
		it('引用ブロックはブロックをネストできる', () => {
			const input = `
> <center>
> a
> </center>
`;
			const output = [
				QUOTE([
					CENTER([
						TEXT('a')
					])
				])
			];
			assert.deepStrictEqual(parse(input), output);
		});
		it('引用ブロックはインライン構文を含んだブロックをネストできる', () => {
			const input = `
> <center>
> I'm @ai, An bot of misskey!
> </center>
`;
			const output = [
				QUOTE([
					CENTER([
						TEXT('I\'m '),
						MENTION('ai', null, '@ai'),
						TEXT(', An bot of misskey!'),
					])
				])
			];
			assert.deepStrictEqual(parse(input), output);
		});
	});

	describe('search', () => {
		describe('検索構文を使用できる', () => {
			it('Search', () => {
				const input = 'MFM 書き方 123 Search';
				const output = [
					createNode('search', {
						query: 'MFM 書き方 123',
						content: input
					})
				];
				assert.deepStrictEqual(parse(input), output);
			});
			it('[Search]', () => {
				const input = 'MFM 書き方 123 [Search]';
				const output = [
					createNode('search', {
						query: 'MFM 書き方 123',
						content: input
					})
				];
				assert.deepStrictEqual(parse(input), output);
			});
			it('search', () => {
				const input = 'MFM 書き方 123 search';
				const output = [
					createNode('search', {
						query: 'MFM 書き方 123',
						content: input
					})
				];
				assert.deepStrictEqual(parse(input), output);
			});
			it('[search]', () => {
				const input = 'MFM 書き方 123 [search]';
				const output = [
					createNode('search', {
						query: 'MFM 書き方 123',
						content: input
					})
				];
				assert.deepStrictEqual(parse(input), output);
			});
			it('検索', () => {
				const input = 'MFM 書き方 123 検索';
				const output = [
					createNode('search', {
						query: 'MFM 書き方 123',
						content: input
					})
				];
				assert.deepStrictEqual(parse(input), output);
			});
			it('[検索]', () => {
				const input = 'MFM 書き方 123 [検索]';
				const output = [
					createNode('search', {
						query: 'MFM 書き方 123',
						content: input
					})
				];
				assert.deepStrictEqual(parse(input), output);
			});
		});
		it('ブロックの前後にあるテキストが正しく解釈される', () => {
			const input = 'abc\nhoge piyo bebeyo 検索\n123';
			const output = [
				TEXT('abc'),
				SEARCH('hoge piyo bebeyo', 'hoge piyo bebeyo 検索'),
				TEXT('123')
			];
			assert.deepStrictEqual(parse(input), output);
		});
	});

	describe('code block', () => {
		it('コードブロックを使用できる', () => {
			const input = '```\nabc\n```';
			const output = [CODE_BLOCK('abc', null)];
			assert.deepStrictEqual(parse(input), output);
		});
		it('コードブロックには複数行のコードを入力できる', () => {
			const input = '```\na\nb\nc\n```';
			const output = [CODE_BLOCK('a\nb\nc', null)];
			assert.deepStrictEqual(parse(input), output);
		});
		it('コードブロックは言語を指定できる', () => {
			const input = '```js\nconst a = 1;\n```';
			const output = [CODE_BLOCK('const a = 1;', 'js')];
			assert.deepStrictEqual(parse(input), output);
		});
		it('ブロックの前後にあるテキストが正しく解釈される', () => {
			const input = 'abc\n```\nconst abc = 1;\n```\n123';
			const output = [
				TEXT('abc'),
				CODE_BLOCK('const abc = 1;', null),
				TEXT('123')
			];
			assert.deepStrictEqual(parse(input), output);
		});
	});

	describe('mathBlock', () => {
		it('1行の数式ブロックを使用できる', () => {
			const input = '\\[math1\\]';
			const output = [
				MATH_BLOCK('math1')
			];
			assert.deepStrictEqual(parse(input), output);
		});
		it('ブロックの前後にあるテキストが正しく解釈される', () => {
			const input = 'abc\n\\[math1\\]\n123';
			const output = [
				TEXT('abc'),
				MATH_BLOCK('math1'),
				TEXT('123')
			];
			assert.deepStrictEqual(parse(input), output);
		});
		it('行末以外に閉じタグがある場合はマッチしない', () => {
			const input = '\\[aaa\\]after';
			const output = [
				TEXT('\\[aaa\\]after')
			];
			assert.deepStrictEqual(parse(input), output);
		});
		it('行頭以外に開始タグがある場合はマッチしない', () => {
			const input = 'before\\[aaa\\]';
			const output = [
				TEXT('before\\[aaa\\]')
			];
			assert.deepStrictEqual(parse(input), output);
		});
	});

	describe('center', () => {
		it('single text', () => {
			const input = '<center>abc</center>';
			const output = [
				CENTER([
					TEXT('abc')
				])
			];
			assert.deepStrictEqual(parse(input), output);
		});
		it('multiple text', () => {
			const input = 'before\n<center>\nabc\n123\n\npiyo\n</center>\nafter';
			const output = [
				TEXT('before'),
				CENTER([
					TEXT('abc\n123\n\npiyo')
				]),
				TEXT('after')
			];
			assert.deepStrictEqual(parse(input), output);
		});
	});

	describe('emoji code', () => {
		it('basic', () => {
			const input = ':abc:';
			const output = [EMOJI_CODE('abc')];
			assert.deepStrictEqual(parse(input), output);
		});
	});

	describe('unicode emoji', () => {
		it('basic', () => {
			const input = '今起きた😇';
			const output = [TEXT('今起きた'), UNI_EMOJI('😇')];
			assert.deepStrictEqual(parse(input), output);
		});
	});

	describe('big', () => {
		it('basic', () => {
			const input = '***abc***';
			const output = [
				FN('tada', { }, [
					TEXT('abc')
				])
			];
			assert.deepStrictEqual(parse(input), output);
		});
		it('内容にはインライン構文を利用できる', () => {
			const input = '***123**abc**123***';
			const output = [
				FN('tada', { }, [
					TEXT('123'),
					BOLD([
						TEXT('abc')
					]),
					TEXT('123')
				])
			];
			assert.deepStrictEqual(parse(input), output);
		});
		it('内容は改行できる', () => {
			const input = '***123\n**abc**\n123***';
			const output = [
				FN('tada', { }, [
					TEXT('123\n'),
					BOLD([
						TEXT('abc')
					]),
					TEXT('\n123')
				])
			];
			assert.deepStrictEqual(parse(input), output);
		});
	});

	describe('bold', () => {
		it('basic', () => {
			const input = '**abc**';
			const output = [
				BOLD([
					TEXT('abc')
				])
			];
			assert.deepStrictEqual(parse(input), output);
		});
		it('内容にはインライン構文を利用できる', () => {
			const input = '**123~~abc~~123**';
			const output = [
				BOLD([
					TEXT('123'),
					STRIKE([
						TEXT('abc')
					]),
					TEXT('123')
				])
			];
			assert.deepStrictEqual(parse(input), output);
		});
		it('内容は改行できる', () => {
			const input = '**123\n~~abc~~\n123**';
			const output = [
				BOLD([
					TEXT('123\n'),
					STRIKE([
						TEXT('abc')
					]),
					TEXT('\n123')
				])
			];
			assert.deepStrictEqual(parse(input), output);
		});
	});

	describe('small', () => {
		it('basic', () => {
			const input = '<small>abc</small>';
			const output = [
				SMALL([
					TEXT('abc')
				])
			];
			assert.deepStrictEqual(parse(input), output);
		});
		it('内容にはインライン構文を利用できる', () => {
			const input = '<small>abc**123**abc</small>';
			const output = [
				SMALL([
					TEXT('abc'),
					BOLD([
						TEXT('123')
					]),
					TEXT('abc')
				])
			];
			assert.deepStrictEqual(parse(input), output);
		});
		it('内容は改行できる', () => {
			const input = '<small>abc\n**123**\nabc</small>';
			const output = [
				SMALL([
					TEXT('abc\n'),
					BOLD([
						TEXT('123')
					]),
					TEXT('\nabc')
				])
			];
			assert.deepStrictEqual(parse(input), output);
		});
	});

	describe('italic 1', () => {
		it('basic', () => {
			const input = '<i>abc</i>';
			const output = [
				ITALIC([
					TEXT('abc')
				])
			];
			assert.deepStrictEqual(parse(input), output);
		});
		it('内容にはインライン構文を利用できる', () => {
			const input = '<i>abc**123**abc</i>';
			const output = [
				ITALIC([
					TEXT('abc'),
					BOLD([
						TEXT('123')
					]),
					TEXT('abc')
				])
			];
			assert.deepStrictEqual(parse(input), output);
		});
		it('内容は改行できる', () => {
			const input = '<i>abc\n**123**\nabc</i>';
			const output = [
				ITALIC([
					TEXT('abc\n'),
					BOLD([
						TEXT('123')
					]),
					TEXT('\nabc')
				])
			];
			assert.deepStrictEqual(parse(input), output);
		});
	});

	describe('italic 2', () => {
		it('basic', () => {
			const input = '*abc*';
			const output = [
				ITALIC([
					TEXT('abc')
				])
			];
			assert.deepStrictEqual(parse(input), output);
		});
	});

	// strike

	// inlineCode

	// mathInline

	// mention

	describe('hashtag', () => {
		it('and unicode emoji', () => {
			const input = '#️⃣abc123#abc';
			const output = [UNI_EMOJI('#️⃣'), TEXT('abc123'), HASHTAG('abc')];
			assert.deepStrictEqual(parse(input), output);
		});
	});

	describe('url', () => {
		it('basic', () => {
			const input = 'official instance: https://misskey.io/@ai.';
			const output = [
				TEXT('official instance: '),
				N_URL('https://misskey.io/@ai'),
				TEXT('.')
			];
			assert.deepStrictEqual(parse(input), output);
		});
	});

	describe('link', () => {
		it('basic', () => {
			const input = '[official instance](https://misskey.io/@ai).';
			const output = [
				LINK(false, 'https://misskey.io/@ai', [
					TEXT('official instance')
				]),
				TEXT('.')
			];
			assert.deepStrictEqual(parse(input), output);
		});

		it('silent flag', () => {
			const input = '?[official instance](https://misskey.io/@ai).';
			const output = [
				LINK(true, 'https://misskey.io/@ai', [
					TEXT('official instance')
				]),
				TEXT('.')
			];
			assert.deepStrictEqual(parse(input), output);
		});

		it('do not yield url node even if label is recognisable as a url', () => {
			const input = 'official instance: [https://misskey.io/@ai](https://misskey.io/@ai).';
			const output = [
				TEXT('official instance: '),
				LINK(false, 'https://misskey.io/@ai', [
					TEXT('https://misskey.io/@ai')
				]),
				TEXT('.')
			];
			assert.deepStrictEqual(parse(input), output);
		});

		it('do not yield link node even if label is recognisable as a link', () => {
			const input = 'official instance: [[https://misskey.io/@ai](https://misskey.io/@ai)](https://misskey.io/@ai).';
			const output = [
				TEXT('official instance: '),
				LINK(false, 'https://misskey.io/@ai', [
					TEXT('[https://misskey.io/@ai](https://misskey.io/@ai)')
				]),
				TEXT('.')
			];
			assert.deepStrictEqual(parse(input), output);
		});
	});

	describe('fn', () => {
		it('basic', () => {
			const input = '[tada abc]';
			const output = [
				FN('tada', { }, [
					TEXT('abc')
				])
			];
			assert.deepStrictEqual(parse(input), output);
		});
	});

	it('composite', () => {
		const input =
`before
<center>
Hello [tada everynyan! 🎉]

I'm @ai, A bot of misskey!

https://github.com/syuilo/ai
</center>
after`;
		const output = [
			TEXT('before'),
			CENTER([
				TEXT('Hello '),
				FN('tada', { }, [
					TEXT('everynyan! '),
					UNI_EMOJI('🎉')
				]),
				TEXT('\n\nI\'m '),
				MENTION('ai', null, '@ai'),
				TEXT(', A bot of misskey!\n\n'),
				N_URL('https://github.com/syuilo/ai')
			]),
			TEXT('after')
		];
		assert.deepStrictEqual(parse(input), output);
	});
});
