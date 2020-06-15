/**
 * 格式化请求参数 去掉undefined值
 */
export const debounce = (fn: Function, delay: number) => {
  let timer: number | undefined;
  return function () {
    const context = this;
    const args = arguments;
    if (timer) {
      clearTimeout(timer);
    }
    timer = window.setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
};
