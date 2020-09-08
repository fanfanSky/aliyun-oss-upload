import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import loadScript from 'load-script';

const uploadApi = `/api/upload?isCkEditor=true`;

var defaultScriptUrl = 'https://cdn.bootcss.com/ckeditor/4.9.2/ckeditor.js';
// var defaultScriptUrl = '../assets/ckeditor.js';

/**
 * @author codeslayer1
 * @description CKEditor component to render a CKEditor textarea with defined configs and all CKEditor events handler
 */
class CKEditor extends React.Component {
  constructor(props) {
    super(props);

    //Bindings
    this.onLoad = this.onLoad.bind(this);

    //State initialization
    this.state = {
      isScriptLoaded: props.isScriptLoaded
    };
  }

  //load ckeditor script as soon as component mounts if not already loaded
  componentDidMount() {
    if (!this.state.isScriptLoaded) {
      loadScript(this.props.scriptUrl, this.onLoad);
    } else {
      this.onLoad();
    }
  }

  componentWillReceiveProps(props) {
    const editor = this.editorInstance;
    if (editor && editor.getData() !== props.value) {
      editor.setData(props.value);
    }
  }

  componentWillUnmount() {
    this.unmounting = true;
  }

  onLoad() {
    if (this.unmounting) return;

    this.setState({
      isScriptLoaded: true
    });

    if (!window.CKEDITOR) {
      console.error('CKEditor not found');
      return;
    }

    this.editorInstance = window.CKEDITOR.appendTo(
      ReactDOM.findDOMNode(this),
      this.props.config,
      this.props.value
    );

    //Register listener for custom events if any
    for (var event in this.props.events) {
      if (event !== 'change') {
        var eventHandler = this.props.events[event];
        this.editorInstance.on(event, eventHandler);
      }
    }

    this.editorInstance.on('change', (e) => {
      this.props.onChange(e.editor.getData());
    });

  }

  render() {
    return <div className={this.props.activeClass} />;
  }
}

CKEditor.defaultProps = {
  config: {
    extraPlugins: 'uploadimage,image2',
    height: 300,
    uploadUrl: uploadApi,
    filebrowserUploadUrl: uploadApi,
    filebrowserImageUploadUrl: uploadApi
  },
  isScriptLoaded: false,
  scriptUrl: defaultScriptUrl,
  activeClass: '',
  events: {},
  onChange: () => { }
};

CKEditor.propTypes = {
  value: PropTypes.any,
  config: PropTypes.object,
  isScriptLoaded: PropTypes.bool,
  scriptUrl: PropTypes.string,
  activeClass: PropTypes.string,
  events: PropTypes.object,
  onChange: PropTypes.func
};

export default CKEditor;
