interface Props {
  condition: boolean;
  wrap: React.FC<any>;
  children: any;
}

const ConditionalWrap: React.FC<Props> = ({ condition, wrap, children }) =>
  condition ? wrap(children) : children;

export default ConditionalWrap;
