import * as ReactDOM from 'react-dom';
import * as React from 'React'
import { Profile } from './profile_IMPLEMENTATION';
import { hux } from './hux_IMPLEMENTATION';

export const App: React.FC = ({ }) => {
    const { Provider } = hux

    return <Provider>
        <Profile />
    </Provider>
}

ReactDOM.render(<App />, document.getElementById("app"))