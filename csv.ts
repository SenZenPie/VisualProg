export function csvToJSON(input: string[], delimiter: string): object[] {
    if (input.length === 0) {
        throw new Error('Input array is empty');
    }
    
    const headers = input[0].split(delimiter);
    const result: object[] = [];
    
    for (let i = 1; i < input.length; i++) {
        const values = input[i].split(delimiter);
        
        if (values.length !== headers.length) {
            throw new Error('Column count mismatch');
        }
        
        const obj: any = {};
        for (let j = 0; j < headers.length; j++) {
            const num = Number(values[j]);
            obj[headers[j]] = isNaN(num) ? values[j] : num;
        }
        result.push(obj);
    }
    
    return result;
}

async function main() {
    const data = ["p1;p2;p3;p4", "1;A;B;c","2;b;n;m"];
    const result = csvToJSON(data, ';');
    console.log(result);
}

main();