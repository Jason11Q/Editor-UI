import inquirer from 'inquirer';
import fs from 'fs-extra';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { kebabCase, pascalCase } from './utils.js';

const listFilePath = '../../packages/components/list.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const RegxMap = {
	IS_COMP_NAME: /^[A-Z]/,
	IS_COMP_ZH_NAME:
		/^(?:[\u3400-\u4DB5\u4E00-\u9FEA\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0])+$/,
};

const collector = async () => {
	const meta = await inquirer.prompt([
		{
			type: 'input',
			message: '请输入你要新建的组件存放目录（不存在会自动创建）：',
			name: 'folder',
		},
		{
			type: 'input',
			message: '请输入你要新建的组件名（纯英文，大写开头，使用多个单词的驼峰命名）：',
			name: 'name',
			validate(answer) {
				const done = this.async();
				const validateRes = RegxMap.IS_COMP_NAME.test(answer);
				if (!validateRes) {
					done('请按要求输入正确的组件名！');
					return;
				}
				const listData = fs.readJSONSync(resolve(__dirname, listFilePath));
				if (listData.find((item) => item.compName === answer)) {
					done('已存在同名组件，请确认后更换名字再重试。');
					return;
				}
				done(null, true);
			},
		},
		{
			type: 'input',
			message: '请输入你要新建的中文名：',
			name: 'label',
			validate(answer) {
				const done = this.async();
				const validateRes = RegxMap.IS_COMP_ZH_NAME.test(answer);
				if (!validateRes) {
					done('请按要求输入正确的组件名！');
					return;
				}
				done(null, true);
			},
		},
		{
			type: 'input',
			message: '请输入组件的功能描述：',
			name: 'desc',
			default: '默认：这是一个新组件',
		},
	]);
	const { name } = meta;
	meta.name = pascalCase(name);
	meta.use = kebabCase(name);
	meta.imp = pascalCase(name.replace('AVW', ''));
	return meta;
};

export { collector };
