import React from 'react';
import Lightbox from 'react-image-lightbox';
import UtilService from '../Common/UtilService';

class LightboxView extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            index: 0,
            isOpen: false,
            images: [],
            titles: [],
        }
    }

    componentDidMount() {
        this.ifMounted = true;
    }

    componentWillUnmount() {
        this.ifMounted = false;
    }

    componentWillReceiveProps(nextProps) {
        this.ifMounted && this.setState({
            index: nextProps.index,
            isOpen: nextProps.isOpen,
            images: nextProps.images,
            titles: nextProps.titles
        });
    }

    closeView(e) {
        if (e)
            e.preventDefault();
        this.props.closeImageView();
    }

    render() {
        const {
            index,
            isOpen,
            images,
            titles,
        } = this.state;

        return (
            <div>
                {isOpen && <Lightbox
                    mainSrc={UtilService.getImageFromPath(images[index])}
                    nextSrc={UtilService.getImageFromPath(images[(index + 1) % images.length])}
                    prevSrc={UtilService.getImageFromPath(images[(index + images.length - 1) % images.length])}

                    onCloseRequest={() => { this.closeView() }}
                    onMovePrevRequest={() => this.setState({
                        index: (index + images.length - 1) % images.length,
                    })}
                    onMoveNextRequest={() => this.setState({
                        index: (index + 1) % images.length,
                    })}

                    imageTitle={titles[index]}
                />}
            </div>
        )
    }
}

export default LightboxView