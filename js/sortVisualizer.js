/* last updated:<2018/04/22/Sun 19:38:11 from:halley-FMVS76G> */

variable = [];                  // 乱数で生成した値を格納(値を変更しない)
array = [];                     // variable の値をソートするための変数
progress = [];                  // 実行したソートの手順を格納
// count は progress にアクセスする際は -1 して使う
count = 0;                      // 現在，ソート手順の何番目まで実行したか
flag = false;                   // showProgress を実行しても良いか
separatorW = 0;
screenW = 800;
screenH = 450;
separatorN = 0;                 // ソートする値の個数
max = 20;                       // 値の最大値
interval = 0;                   // 経過を表示する際のインターバル

function sortVisualizer() {
  init();

  // button
  $("#start_stop").on('click', function() {
    flag = !flag;
    if(flag == true) {
      $("#sort option").attr({"disabled": "disabled"});
      setTimeout(showProgress, interval);
      $("#start_stop").html("stop");
    } else {
      $("#sort option").removeAttr("disabled");
      $("#start_stop").html("start");
    }
  });

  $("#fast").on('click', function() {
    interval -= 10;
    if(interval < 0) interval = 0;
    setInfo();
  });

  $("#slow").on('click', function() {
    interval += 10;
    setInfo();
  });

  $("#inc").on('click', function() {
    if(flag == false) {
      separatorN += 1;
      reset();
    }
  });

  $("#dec").on('click', function() {
    if(flag == false) {
      separatorN -= 1;
      if(separatorN < 3) separatorN = 3;
      reset();
    }
  });

  $("#sort").change(function() {
    reset(false);
  });

  $("#reset").on('click', function() {
    if(flag == false) {
      init();
    }
  });
  // slider
  $("#progBar").on('input', function() {
    adjustProgress(count, parseInt($(this).val() - count));
  });
}

// 初期設定
function init() {
  $("#sort").val("quickSort");
  separatorN = 30;
  interval = 70;
  setConfig();
  setVariable();
  setScreen();
  doSort();
  setInfo();
}

function showProgress() {
  // ソート終了後にもう一度 start ボタンが押された時のエラー処理
  if(progress.length <= count) {
    setButton();
    return 0;
  }
  removeAllClass(count-1);
  count += 1;
  addAllClass(count-1);
  setInfo();
  if(count-1 < progress.length && flag) {
    setTimeout(showProgress, interval);
  } else {
    setButton();
  }
}

function adjustProgress(base, diff) {
  var sign = 1;                 // plus or minus
  if(diff == 0) return;
  if(diff < 0) {
    sign = -1;
    diff *= -1;
  }
  for(var i = 1; i <= diff; i++) {
    var current = base+(sign*i);
    removeAllClass(current-1-sign, sign);
    addAllClass(current-1, sign);
  }

  count = base + (sign * diff);
  setInfo();
}

// progress[index] のクラスを追加
function addAllClass(index, sign=1) {
  if(index < 0 || progress.length-1 < index) return;
  $(".variable").removeClass("swap comp");
  progress[index].forEach(function(set) {
    switch(set[0]) {
    case "swap":
      if(sign == 1) {
        swapHeightOfDiv(set[1], set[2]);
      } else {
        $("#sep"+set[1]+" .variable").addClass("swap");
        $("#sep"+set[2]+" .variable").addClass("swap");
      }
      break;
    case "comp":
      $("#sep"+set[1]+" .variable").addClass("comp");
      $("#sep"+set[2]+" .variable").addClass("comp");
      break;
    case "sorted":
      $("#sep"+set[1]+" .variable").addClass("sorted");
      break;
    }
  });
}
// progress[index] のクラスを除去
function removeAllClass(index, sign=1) {
  if(index < 0 || progress.length-1 < index) return;
  $(".variable").removeClass("swap comp");
  progress[index].forEach(function(set) {
    switch(set[0]) {
    case "swap":
      if(sign == -1) {
        swapHeightOfDiv(set[1], set[2]);
      }
      break;
    case "comp":
      $("#sep"+set[1]+" .variable").removeClass("comp");
      $("#sep"+set[2]+" .variable").removeClass("comp");
      break;
    case "sorted":
      if(sign == -1) $("#sep"+set[1]+" .variable").removeClass("sorted");
      break;
    }
  });
}

// progress の index番目の配列の 0, 1番目の要素の高さを入れ替える
// num1, と num2 の要素の高さを入れ替える
function swapHeightOfDiv(num1, num2) {
  $("#sep"+num1+" .variable").addClass("swap");
  $("#sep"+num2+" .variable").addClass("swap");
  var h1 = $("#sep"+num1+" .variable").height();
  var h2 = $("#sep"+num2+" .variable").height();
  $("#sep"+num1+" .variable").height(h2);
  $("#sep"+num2+" .variable").height(h1);
}

function reset(unsetVar = true) {
  setConfig();
  if(unsetVar) setVariable();
  setScreen();
  doSort();
  setInfo();
}

function setConfig() {
  count = 0;
  setButton();
}

function setButton() {
  flag = false;
  $("#sort option").removeAttr("disabled");
  $("#start_stop").html("start");
}

function setVariable() {
  variable = [];
  for(var i = 0; i < separatorN; i++) {
    variable.push(1 + Math.floor(Math.random() * max));
  }
}

// screen の初期設定
function setScreen() {
  separatorW = screenW / separatorN;
  $("#screen").html("");
  for(var i = 0; i < separatorN; i++) {
    $("#screen").append('<div id="sep'+i+'" class="separator"></div>');
    $("#sep"+i).html('<div class="variable"></div>');
    var h = screenH * variable[i] / max;
    $("#sep"+i).css({"left": separatorW*i + "px"});
    $("#sep"+i+" .variable").animate({"height": h+"px"}, 0, "swing");
  }
  $(".separator").css({"width": separatorW+"px"});
}

function doSort() {
  array = copyArray(variable);
  progress = [];
  eval($("#sort").val() + "()");
}

function setInfo() {
  $(".variable").removeClass("completed");
  if(count == progress.length) $(".variable").addClass("completed");

  var str = "";
  str += "<span class='tag'>interval: </span>" + interval + "ms";
  str += "<span class='tag'>num: </span>" + separatorN;
  str += "<span class='tag'>progress: </span>" +count+"/"+progress.length;
  $("#info").html(str);

  // progress bar
  $("#progBar").val(count);
  $("#progBar").attr({"max": progress.length});
}

function copyArray(variable) {
  var newArray = [];
  for(var i = 0; i < variable.length; i++) {
    newArray.push(variable[i]);
  }
  return newArray;
}

// sort ################
function bubbleSort() {
  for(var i = 0; i < array.length; i++) {
    for(var j = 0; j < array.length - i - 1; j++) {
      if(comp(j+1, j)) {
        swap(j, j+1);
      }
    }
    recordSorted(array.length-1-i);
  }
}

function quickSort(left = 0, right = array.length) {
  var pivotPos = left;
  for(var i = left+1; i <= right; i++) {
    if(comp(i, left)) {
      pivotPos += 1;
      swap(pivotPos, i);
    }
  }
  swap(left, pivotPos);
  recordSorted(pivotPos);
  if(left < pivotPos-1) quickSort(left, pivotPos-1);
  if(pivotPos+1 < right) quickSort(pivotPos+1, right);
}

function shakerSort() {
  // ソート済みの個数
  var left = 0, right = 0;
  for(var i = 0; left + right < array.length; i++) {
    for(var j = left; j < array.length - right - 1; j++) {
      if(comp(j+1, j)) {
        swap(j, j+1);
      }
    }
    right += 1;
    recordSorted(array.length-right);
    for(var j = array.length - right - 1; left < j; j--) {
      if(comp(j, j-1)) {
        swap(j-1, j);
      }
    }
    left += 1;
    recordSorted(left-1);
  }
}

// ソート済みの要素を記録
function recordSorted(num) {
  progress[progress.length-1].push(["sorted", num]);
}

// 配列の指定要素の値を入れ替える
function swap(num1, num2) {
  if(num1 == num2) return;
  var temp;
  temp = array[num1];
  array[num1] = array[num2];
  array[num2] = temp;
  progress.push([["swap", num1, num2]]);
}

// 値を比較する関数，この時 progress に比較した値の要素番号を入れる
// num1 < num2 を返す
function comp(num1, num2) {
  progress.push([["comp", num1, num2]]);
  return array[num1] < array[num2]
}

$(function() {
  sortVisualizer();
});
