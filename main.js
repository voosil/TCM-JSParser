const regDoseNum = '([1-9]\\d*|0)(\\.\\d)?';
const chineseNum = '半一二三四五六七八九两';
const chineseDose = `([${chineseNum}]?(十?)[${chineseNum}])?`;

const doseUnit = '[厘克分钱斤两升个枚片]';
const doseReg = new RegExp(`((${regDoseNum}${chineseDose})+${doseUnit})`, 'g');

const noteReg = /(\(|（)(\S*)(\)|）)/g;
//(?<=(${regDoseNum}|${chineseDose}))
// const data = `半夏二两半，人参半两，防风根3钱，羌活1.5两，柴胡十钱5分，甘草3分4厘，蔓荆子0.5两，升麻0.5两，粉葛0.5两，独活3分，红芪0.5两，人参3分，当归身3分(酒浸)，陈皮3分，黄柏3分(酒浸)，姜黄 地黄3分(酒洗)，地骨皮0.5两。`

// const dataArray = data.split('，')

// 设计一种二元运算满足：
// 1.f(负数,自然数) = 自然数
// 2.f(负数,负数) = -1
// 3.f(自然数,自然数) = 最小的自然数
const getMedicineEndPosition = (x, y) => {
  if (x >= 0 && y >= 0) {
    //3
    return x < y ? x : y;
  } else if (x | (y < 0)) {
    //1
    return x < 0 ? y : x;
  } else {
    //2
    return -1;
  }
};

const doseNum = new RegExp(regDoseNum, 'g');
const doseCn = new RegExp(chineseDose, 'g');
const unit = new RegExp(doseUnit, 'g');

const doseConversion = (dose) => {
  dose = dose.toString().replace(',', '');

  let ms = dose.search(doseNum);
  let us = dose.search(doseCn);
  let s = getMedicineEndPosition(ms, us);
  let u = dose.match(unit);

  if (s >= 0) {
    return ms < 0
      ? cnToNum(u, dose.match(doseCn), ts)
      : ts(u, dose.match(doseNum));
  } else {
    return 0;
  }
};

const cnToNum = (u, cn, callback) => {
  // eg: 五十三钱三分  ['钱'，‘分’]>u  ['五十三'，‘三’]>cn
  const iCn = '一二三四五六七八九';
  const reg = /十/;
  let n = [];

  cn.forEach((e) => {
    let tmp = e.split('');
    if (tmp[0] == '十') {
      tmp.unshift('一');
      callback(ts(u, cnToNumPre(tmp)));
    } else {
      callback(ts(u, cnToNumPre(tmp)));
    }
  });
};

const cnToNumPre = (cns) => {
  //cns > ['五','十','三']   解决：【2两半】 的问题
  const iCn = '一二三四五六七八九';
  const spTwo = /两/;
  const spHalf = /半/;
  const reg = /[1-9]/;

  let rs = [];
  cns.foreach((e, i) => {
    if (e == '十') {
      rs[i - 1] = cns[i - 1] * 10;
    } else {
      if (spTwo.test(e)) rs.push(2);
      else if (spHalf.test(e)) rs.push(0.5);
      else if (reg.test(e)) rs.push(e);
      //解决：【2两半】 的问题
      else rs.push(iCn.search(e) + 1);
    }
  });
  return eval(rs.join('+'));
};

//1.例如 ‘2两半’ 这样的： match+cnToNum得到数组 [2,0.5] [‘两’]，在0.5没有对应单位的情况，自动默认单位是恰低于'两'的'钱';
// 经过 cnToNumPre 处理后，n type === float
// u>['钱'，‘分’] n>[12,5]
const ts = (u, n) => {
  var unit_arr = ['厘', '分', '钱', '两', '斤', '克', '升', '枚', '个'];
  var unit_measure = [0.03, 0.3, 3, 30, 500, 1, 0, , 0, 0]; //"升",'枚','个' > 0
  var result = 0;

  n.forEach((e, i) => {
    let measureIndex = u[i]
      ? unit_arr.indexOf(u[i])
      : unit_arr.indexOf(u[i]) - 1;
    result += e * unit_measure[measureIndex];
  });

  return result.toString().match(/([1-9]\d*|0)(\.\d){0,2}/)[0];
};

const parse = (dataArray) => {
  var resultArray = [];
  dataArray.forEach((e) => {
    //取出括号里面的备注内容
    let note = noteReg.test(e)
      ? e.match(noteReg)[0].replace(/\(|\)|（|）/g, '')
      : '';
    let dose = doseReg.test(e) ? doseConversion(e.match(doseReg)) : '';
    let medicine;
    let p = getMedicineEndPosition(e.search(noteReg), e.search(doseReg));
    if (p >= 0) {
      medicine = e.slice(0, p);
      // resultArray.push({note,dose,medicine})
    } else {
      medicine = e;
      // resultArray.push({note,dose,medicine})
    }
    resultArray.push({ note, dose, medicine });
  });
  return resultArray;
};
