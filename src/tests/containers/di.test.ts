import { DIContainer } from '../../containers/diContainer';

class Foo {
  name: string;
  constructor() {
    this.name = 'Foo';
  }
}

class Bar {
  value: number;
  constructor() {
    this.value = 42;
  }
}

describe('DIContainer', () => {
  let container: DIContainer<{ foo: Foo; bar: Bar }>;

  beforeEach(() => {
    container = new DIContainer<{ foo: Foo; bar: Bar }>();
  });

  test('should register and retrieve dependencies correctly', () => {
    // Act
    container.register('foo', Foo);
    container.register('bar', Bar);

    // Assert
    const fooInstance = container.get('foo');
    expect(fooInstance).toBeInstanceOf(Foo);
    expect(fooInstance.name).toBe('Foo');

    const barInstance = container.get('bar');
    expect(barInstance).toBeInstanceOf(Bar);
    expect(barInstance.value).toBe(42);
  });

  test('should throw an error when retrieving a non-existent dependency', () => {
    // Act & Assert
    expect(() => container.get('foo')).toThrow('No instance found for key: foo');
  });
});
