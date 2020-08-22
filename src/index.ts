interface A {
  name: string;
}

function getName(): A {
  return {
    name: "Diego",
  };
}

console.log(getName());
