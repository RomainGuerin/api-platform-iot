import PropTypes from 'prop-types';

const Button = ({ onClick, children, className }) => {
    return (
        <button onClick={onClick} className={className}>
            {children}
        </button>
    );
};

Button.propTypes = {
    onClick: PropTypes.func,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};

export default Button;