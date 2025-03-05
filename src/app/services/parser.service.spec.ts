import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ParserService } from './parser.service';

describe('ParserService (Signals)', () => {
  let service: ParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ParserService, provideExperimentalZonelessChangeDetection()],
    });
    service = TestBed.inject(ParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should produce a graph with 1 node/0 edges for an empty object', () => {
    service.parseJson({});
    const graph = service.graph();
    // The parser always creates a node labeled "Object" even if it has no properties.
    expect(graph.nodes.length).toBe(1);
    expect(graph.edges.length).toBe(0);
  });

  it('should parse a simple object with one key-value pair', () => {
    const simpleObject = { key: 'value' };
    service.parseJson(simpleObject);

    const graph = service.graph();
    // Expected structure:
    //  - 1 node for the root Object
    //  - 1 node for "key" (the property name)
    //  - 1 node for "value" (the string)
    //  - edges: Object->key, key->value
    expect(graph.nodes.length).toBe(3);
    expect(graph.edges.length).toBe(2);

    const labels = graph.nodes.map((n) => n.label);
    expect(labels).toContain('Object');
    expect(labels).toContain('key');
    expect(labels).toContain('value');
  });

  it('should parse an array of primitives', () => {
    const primitiveArray = [1, 'test', false];
    service.parseJson(primitiveArray);

    const graph = service.graph();
    // Expected structure:
    //  - 1 node for the array (label "Array (3)")
    //  - 3 nodes for each element: "1", "test", "false"
    //  - edges: array->1, array->test, array->false
    expect(graph.nodes.length).toBe(4);
    expect(graph.edges.length).toBe(3);

    const arrayNode = graph.nodes.find((n) => n.label.startsWith('Array'));
    expect(arrayNode).toBeDefined();
    expect(arrayNode?.label).toBe('Array (3)');

    const labels = graph.nodes.map((n) => n.label);
    expect(labels).toContain('1');
    expect(labels).toContain('test');
    expect(labels).toContain('false');
  });

  it('should parse a nested object', () => {
    const nestedObject = {
      outerKey: {
        innerKey: 42,
      },
    };
    service.parseJson(nestedObject);

    const graph = service.graph();
    // Expected structure:
    //  - 1 node for outer Object
    //  - 1 node for "outerKey"
    //  - 1 node for inner Object
    //  - 1 node for "innerKey"
    //  - 1 node for "42"
    //  - edges: outer Object->outerKey, outerKey->inner Object,
    //           inner Object->innerKey, innerKey->42
    expect(graph.nodes.length).toBe(5);
    expect(graph.edges.length).toBe(4);

    const labels = graph.nodes.map((n) => n.label);
    expect(labels).toContain('Object');
    expect(labels).toContain('outerKey');
    expect(labels).toContain('innerKey');
    expect(labels).toContain('42');
  });

  it('should parse an array of objects', () => {
    const arrayOfObjects = [{ name: 'Alice' }, { name: 'Bob' }];
    service.parseJson(arrayOfObjects);
  
    const graph = service.graph();
    // 7 nodes: 
    //   1 for the array, 
    //   2 for the objects, 
    //   2 for the property names, 
    //   2 for the values
    expect(graph.nodes.length).toBe(7);
  
    // 6 edges:
    //   array->object1, object1->name, name->Alice,
    //   array->object2, object2->name, name->Bob
    expect(graph.edges.length).toBe(6);
    
    // rest of your assertions...
  });
});