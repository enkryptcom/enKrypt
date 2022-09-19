export function sayHello(name: string): string {
    const abc: ExampleType = {
        platform: "my-platform",
        version: "my-version"
    }
    return `Hello ${name} ${JSON.stringify(abc)}`;
}