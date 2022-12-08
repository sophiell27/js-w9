
function toThousands(num) {
    let thousands = num.toString().split(".");
    thousands[0] = thousands[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return thousands.join(".");
}
