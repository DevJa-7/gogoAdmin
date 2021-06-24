import React from 'react';

class SortHeader extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            direction: 0
        }
    }

    clickItem(e) {
        e.preventDefault()
        e.stopPropagation()

        var d = this.state.direction
        switch (d) {
            case 0: d = 1; break;
            case 1: d = -1; break;
            case -1: d = 0; break;
        }

        this.state.direction = d;
        this.setState({
            direction: this.state.direction
        })

        this.props.action(this.props.sortField, this.state.direction)
        this.props.setActiveIndex(this.props.sortIndex)
    }

    render() {
        const sortIndex = this.props.sortIndex;
        const activeIndex = this.props.activeIndex
        var renderIcon = null
        if (sortIndex == activeIndex) {
            if (this.state.direction == -1) {
                renderIcon = <em className="fa fa-sort-down"></em>
            } else if (this.state.direction == 1) {
                renderIcon = <em className="fa fa-sort-up"></em>
            } else {
                renderIcon = <em className="fa fa-unsorted"></em>
            }
        } else {
            renderIcon = <em className="fa fa-unsorted"></em>
        }
        return (
            <div>
                <a href="" onClick={this.clickItem.bind(this)} style={{ marginRight: '5px' }}><strong>{this.props.label}</strong></a>
                {renderIcon}
            </div>
        )
    }
}

export default SortHeader