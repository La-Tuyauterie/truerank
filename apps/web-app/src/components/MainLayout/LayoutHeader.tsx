import styles from './LayoutHeader.module.css'

export function LayoutHeader() {
    return (
        <div className={styles.headerContainer}>
            <header className={styles.header}>
                <h2>Truerank</h2>
            </header>
        </div>
    );
}
