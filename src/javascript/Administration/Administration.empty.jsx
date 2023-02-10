import React from 'react';
import {Typography} from '@jahia/moonstone';
import {Setting} from '@jahia/moonstone';
import {ArrowRight} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: '100%',
        paddingTop: 40,
        background: '#EFEFEF'
    },
    icon: {
        display: 'flex',
        justifyContent: 'center',
        width: 100
    },
    text: {
        display: 'flex',
        flexDirection: 'column',
        width: 400
    },
    link: {
        display: 'flex',
        alignItems: 'center'
    }
};

const AdministrationEmpty = () => {
    const {t} = useTranslation('jahia-administration');
    return (
        <div style={styles.container}>
            <div style={styles.icon}>
                <Setting/>
            </div>
            <div style={styles.text}>
                <Typography component="h2" variant="strong">{t('jahia-administration.label')}</Typography>
                <Typography component="p">{t('jahia-administration.about')}</Typography>
                <a style={styles.link} href={window.contextJsParameters.config.links.documentation} target="_blank" rel="noopener noreferrer">
                    {t('jahia-administration.learnmore')}
                    <ArrowRight/>
                </a>
            </div>
        </div>
    );
};

export default AdministrationEmpty;
